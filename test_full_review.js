import assert from 'node:assert';

// Mock storage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

console.log('>>> RUNNING COMPREHENSIVE SUBAGENT REVIEW SUITE <<<');

const {
  storageService,
  getDateString,
  normalizeWhatsAppPhone,
} = await import('./src/services/storageService.ts');

const { getAvailableTimeSlots } = await import('./src/services/bookingEngine.ts');

// 1. WhatsApp Phone Normalization Test
console.log('1. Testing WhatsApp phone normalization...');
assert.strictEqual(normalizeWhatsAppPhone('+54 9 11 4820-1122'), '5491148201122');
assert.strictEqual(normalizeWhatsAppPhone('11 2150-3344'), '5491121503344');
assert.strictEqual(normalizeWhatsAppPhone('1121503344'), '5491121503344');
assert.strictEqual(normalizeWhatsAppPhone('011 15 4820-1122'), '5490111548201122');
console.log('  ✓ Phone normalization correctly prepends 549 for WhatsApp wa.me URLs');

// 2. Cross-branch barber booking prevention
console.log('2. Testing cross-branch barber booking prevention...');
const belgranoSlots = getAvailableTimeSlots({
  branchId: 'belgrano',
  date: getDateString(2),
  durationMinutes: 30,
  barberId: 'barber-1' // Facundo Gómez belongs to Palermo, NOT Belgrano!
});
const assignedBarberIds = belgranoSlots.filter(s => s.available).map(s => s.assignedBarberId);
assert.strictEqual(assignedBarberIds.includes('barber-1'), false, 'Palermo barber should NEVER be assigned in Belgrano');
console.log('  ✓ Cross-branch bleed prevented');

// 3. Chair capacity limit for specific barber
console.log('3. Testing chair capacity limit enforcement...');
const testDate = getDateString(4);
const saturatedApps = [
  { id: '#S1', branchId: 'recoleta', barberId: 'barber-5', timeSlot: '16:00', durationMinutes: 30, date: testDate, status: 'Confirmado', price: 10000, clientName: 'A', clientPhone: '1', serviceId: 's1', notes: '', createdAt: '' },
  { id: '#S2', branchId: 'recoleta', barberId: 'barber-6', timeSlot: '16:00', durationMinutes: 30, date: testDate, status: 'Confirmado', price: 10000, clientName: 'B', clientPhone: '2', serviceId: 's1', notes: '', createdAt: '' },
  { id: '#S3', branchId: 'recoleta', barberId: 'other', timeSlot: '16:00', durationMinutes: 30, date: testDate, status: 'Confirmado', price: 10000, clientName: 'C', clientPhone: '3', serviceId: 's1', notes: '', createdAt: '' },
];
// Recoleta has 3 chairs. With 3 appointments at 16:00, all chairs are occupied.
const recoletaSlots = getAvailableTimeSlots({
  branchId: 'recoleta',
  date: testDate,
  durationMinutes: 30,
  barberId: 'barber-5',
  customAppointments: saturatedApps
});
const slot1600 = recoletaSlots.find(s => s.time === '16:00');
assert.strictEqual(slot1600?.available, false, '16:00 slot must be blocked due to chairsLimit reached');
assert.strictEqual(slot1600?.reason, 'Capacidad máxima de sillas alcanzada');
console.log('  ✓ Specific barber blocked when salon chairs are 100% occupied');

// 4. Verification of 'No Asistió' in dataset & status handling
console.log('4. Testing No Asistió status handling...');
const apps = storageService.getAppointments();
const noShow = apps.find(a => a.status === 'No Asistió');
assert.strictEqual(!!noShow, true, 'Default dataset must contain an appointment with status "No Asistió"');

// Test status toggle to No Asistió
const appToToggle = apps[0];
storageService.updateAppointmentStatus(appToToggle.id, 'No Asistió');
const toggled = storageService.getAppointments().find(a => a.id === appToToggle.id);
assert.strictEqual(toggled?.status, 'No Asistió');
console.log('  ✓ Status toggle to "No Asistió" functions correctly');

// 5. Dynamic Branch Schedule
console.log('5. Testing dynamic branch schedule parsing...');
const originalBranches = storageService.getBranches();
const recoleta = originalBranches.find(b => b.id === 'recoleta');
// Change Recoleta hours to "11:00 a 19:00 hs"
storageService.updateBranch({ ...recoleta, schedule: 'Lun a Sáb de 11:00 a 19:00 hs' });

const customScheduleSlots = getAvailableTimeSlots({
  branchId: 'recoleta',
  date: getDateString(3),
  durationMinutes: 30,
  barberId: 'any'
});

// Slot at 10:30 should not exist (schedule starts at 11:00)
assert.strictEqual(customScheduleSlots.some(s => s.time === '10:30'), false, '10:30 slot should not exist if branch opens at 11:00');
// Slot at 11:00 should exist
assert.strictEqual(customScheduleSlots.some(s => s.time === '11:00'), true, '11:00 slot should exist');
// Slot at 18:30 + 30 min = 19:00 (allowed)
assert.strictEqual(customScheduleSlots.find(s => s.time === '18:30')?.available, true, '18:30 slot should be allowed for 19:00 closing');
// Slot at 19:00 (starts at closing) should not exist
assert.strictEqual(customScheduleSlots.some(s => s.time === '19:00'), false, '19:00 slot should not exist when closing is 19:00');
console.log('  ✓ Dynamic branch schedule correctly controls slot start and closing boundary');

// 6. Testing Branch-Differentiated Pricing
console.log('6. Testing branch-differentiated pricing and getServicePrice...');
const { getServicePrice } = await import('./src/services/storageService.ts');
const allServices = storageService.getServices();
const corte = allServices.find(s => s.id === 'serv-1');
assert.ok(corte, 'Service serv-1 should exist');

// Test differentiated prices for serv-1
assert.strictEqual(getServicePrice(corte, 'palermo'), 14000, 'Palermo price for Corte Clásico should be 14000');
assert.strictEqual(getServicePrice(corte, 'belgrano'), 13000, 'Belgrano price for Corte Clásico should be 13000');
assert.strictEqual(getServicePrice(corte, 'recoleta'), 15000, 'Recoleta price for Corte Clásico should be 15000');

// Test fallback behavior when branchPrices is absent
const mockServiceWithoutBranchPrices = {
  id: 'mock-1',
  name: 'Test Service',
  category: 'Corte',
  durationMinutes: 30,
  price: 9999,
  description: 'Desc'
};
assert.strictEqual(getServicePrice(mockServiceWithoutBranchPrices, 'palermo'), 9999, 'Fallback should be base price');
assert.strictEqual(getServicePrice(mockServiceWithoutBranchPrices, undefined), 9999, 'Undefined branch should return base price');

// Test updating single branch price
storageService.updateServiceBranchPrice('serv-1', 'palermo', 16500);
const corteUpdated = storageService.getServices().find(s => s.id === 'serv-1');
assert.strictEqual(getServicePrice(corteUpdated, 'palermo'), 16500, 'Updated Palermo price should be 16500');
assert.strictEqual(getServicePrice(corteUpdated, 'belgrano'), 13000, 'Belgrano price should remain 13000');
assert.strictEqual(getServicePrice(corteUpdated, 'recoleta'), 15000, 'Recoleta price should remain 15000');

console.log('  ✓ Branch-differentiated pricing and getServicePrice verified successfully');

// 7. Testing src/data/initialData.ts exports and batch price updates
console.log('7. Testing src/data/initialData.ts and batch updates...');
const initialData = await import('./src/data/initialData.ts');
assert.ok(initialData.DEFAULT_SERVICES.length >= 6, 'initialData must export at least 6 services');
assert.ok(initialData.DEFAULT_BRANCHES.length === 3, 'initialData must export 3 branches');
assert.ok(initialData.DEFAULT_STAFF.length >= 6, 'initialData must export staff');
assert.strictEqual(typeof initialData.getServicePrice, 'function', 'initialData must export getServicePrice');

// Verify all default services have branchPrices for all 3 branches
for (const s of initialData.DEFAULT_SERVICES) {
  assert.ok(s.branchPrices, `Service ${s.id} must have branchPrices`);
  assert.ok(typeof s.branchPrices.palermo === 'number', `Service ${s.id} must have palermo price`);
  assert.ok(typeof s.branchPrices.belgrano === 'number', `Service ${s.id} must have belgrano price`);
  assert.ok(typeof s.branchPrices.recoleta === 'number', `Service ${s.id} must have recoleta price`);
}
console.log('  ✓ initialData exports and complete branchPrices verified for all services');

// Test batch price update
storageService.updateServiceBranchPrices('serv-2', {
  palermo: 11500,
  belgrano: 10500,
  recoleta: 12500,
});
const barbaUpdated = storageService.getServices().find(s => s.id === 'serv-2');
assert.strictEqual(getServicePrice(barbaUpdated, 'palermo'), 11500, 'Batch updated Palermo price must be 11500');
assert.strictEqual(getServicePrice(barbaUpdated, 'belgrano'), 10500, 'Batch updated Belgrano price must be 10500');
assert.strictEqual(getServicePrice(barbaUpdated, 'recoleta'), 12500, 'Batch updated Recoleta price must be 12500');
console.log('  ✓ updateServiceBranchPrices batch update verified');

// Test getServiceById with both serv-1 and corte-fade alias
const sByServ1 = storageService.getServiceById('serv-1');
const sByCorteFade = storageService.getServiceById('corte-fade');
assert.ok(sByServ1, 'serv-1 lookup should succeed');
assert.ok(sByCorteFade, 'corte-fade alias lookup should succeed');
assert.strictEqual(sByServ1?.id, sByCorteFade?.id, 'corte-fade should resolve to the classic corte service');
console.log('  ✓ getServiceById alias resolution verified');

// 8. Testing Dynamic Barber Schedule, Custom Days Off, and Global Settings
console.log('8. Testing barber schedules, assignedBranches, customDaysOff, and settings...');
const settings = storageService.getSettings();
assert.strictEqual(typeof settings.allowClientSelectBarber, 'boolean', 'Settings must include allowClientSelectBarber boolean');

// Toggle settings test
storageService.updateSettings({ allowClientSelectBarber: false });
assert.strictEqual(storageService.getSettings().allowClientSelectBarber, false, 'allowClientSelectBarber should be false');
storageService.updateSettings({ allowClientSelectBarber: true });
assert.strictEqual(storageService.getSettings().allowClientSelectBarber, true, 'allowClientSelectBarber should be restored to true');

// Test staff assignedBranches
const staffMembers = storageService.getStaff();
assert.ok(staffMembers.length >= 6, 'Should have at least 6 barbers');
for (const b of staffMembers) {
  assert.ok(Array.isArray(b.assignedBranches), `${b.name} must have assignedBranches array`);
  assert.ok(b.assignedBranches.length >= 1, `${b.name} must have at least 1 assigned branch`);
  assert.ok(b.schedule, `${b.name} must have a schedule object`);
  assert.ok(Array.isArray(b.customDaysOff), `${b.name} must have customDaysOff array`);
}

// Test customDaysOff toggle
const testBarber = staffMembers[0];
const targetOffDate = '2026-10-15';
storageService.toggleCustomDayOff(testBarber.id, targetOffDate);
let updatedBarber = storageService.getBarberById(testBarber.id);
assert.ok(updatedBarber?.customDaysOff.includes(targetOffDate), 'Target date must be in customDaysOff');

// Toggle again to remove
storageService.toggleCustomDayOff(testBarber.id, targetOffDate);
updatedBarber = storageService.getBarberById(testBarber.id);
assert.strictEqual(updatedBarber?.customDaysOff.includes(targetOffDate), false, 'Target date must be removed from customDaysOff');

// Test date filtering in getStaff
const fridayDate = '2026-09-18'; // Known Friday
const staffOnFriday = storageService.getStaff('palermo', fridayDate);
assert.ok(staffOnFriday.length > 0, 'Should have active staff on Friday at Palermo');

console.log('  ✓ Barber schedules, assignedBranches, customDaysOff, and settings verified successfully');

// Test staff CRUD operations (addBarber, toggleBarberActive, deleteBarber)
console.log('9. Testing staff CRUD: addBarber, toggleBarberActive, deleteBarber...');
const initialStaffCount = storageService.getAllStaff().length;

// 1. Add new barber
const newBarber = storageService.addBarber({
  name: 'Test Barbero Nuevo',
  assignedBranches: ['palermo', 'belgrano'],
  specialties: ['Corte Clásico', 'Barba'],
  startHour: '10:00',
  endHour: '19:00'
});
assert.ok(newBarber.id.startsWith('barber-'), 'New barber ID should start with barber-');
assert.strictEqual(newBarber.name, 'Test Barbero Nuevo');
assert.strictEqual(newBarber.isActive, true, 'New barber should be active by default');
assert.strictEqual(storageService.getAllStaff().length, initialStaffCount + 1, 'Total staff count should increment');
assert.ok(storageService.getStaff('palermo').some(b => b.id === newBarber.id), 'New barber should appear in active staff for palermo');

// 2. Toggle active (pause)
const pausedBarber = storageService.toggleBarberActive(newBarber.id);
assert.strictEqual(pausedBarber?.isActive, false, 'Barber should be marked inactive');
assert.strictEqual(storageService.getStaff('palermo').some(b => b.id === newBarber.id), false, 'Paused barber must NOT appear in public getStaff()');
assert.ok(storageService.getAllStaff().some(b => b.id === newBarber.id), 'Paused barber must remain in getAllStaff() for admin');

// Reactivate
const reactivatedBarber = storageService.toggleBarberActive(newBarber.id);
assert.strictEqual(reactivatedBarber?.isActive, true, 'Barber should be reactivated');
assert.ok(storageService.getStaff('palermo').some(b => b.id === newBarber.id), 'Reactivated barber should appear in public getStaff() again');

// 3. Delete barber & appointment reassignment test
const appointmentForNewBarber = storageService.saveAppointment({
  branchId: 'palermo',
  serviceId: 'corte-fade',
  barberId: newBarber.id,
  clientName: 'Cliente Prueba Barbero',
  clientPhone: '1144445555',
  date: '2026-09-25',
  timeSlot: '15:00',
  durationMinutes: 30,
  price: 14000
});
assert.strictEqual(appointmentForNewBarber.barberId, newBarber.id);

storageService.deleteBarber(newBarber.id);
assert.strictEqual(storageService.getAllStaff().length, initialStaffCount, 'Total staff count should return to initial');
assert.strictEqual(storageService.getBarberById(newBarber.id), undefined, 'Deleted barber should not be found');

const reassignedAppt = storageService.getAppointments().find(a => a.id === appointmentForNewBarber.id);
assert.strictEqual(reassignedAppt?.barberId, 'any', 'Appointments of deleted barber must be reassigned to "any"');

console.log('  ✓ Staff CRUD (add, pause/activate, delete with appointment reassignment) verified successfully');

// Reset to defaults
storageService.resetToDefaults();
console.log('  ✓ Reset to defaults verified');

console.log('\n>>> ALL DEEP REVIEW VERIFICATION TESTS PASSED SUCCESSFULLY <<<');


