import assert from 'node:assert';

// Mock storage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Import storageService
const { storageService, getDateString } = await import('./src/services/storageService.ts');
const { getAvailableTimeSlots } = await import('./src/services/bookingEngine.ts');

console.log('--- Starting E2E Dataset & Booking Engine Verification ---');

// 1. Verify Branches
const branches = storageService.getBranches();
assert.strictEqual(branches.length, 3, 'Must have exactly 3 branches');
const branchIds = branches.map(b => b.id).sort();
assert.deepStrictEqual(branchIds, ['belgrano', 'palermo', 'recoleta']);
console.log('✓ 3 Branches verified (Palermo, Belgrano, Recoleta)');

// 2. Verify Mandatory Services
const services = storageService.getServices();
assert.strictEqual(services.length >= 6, true, 'Must have at least 6 services');

const s1 = services.find(s => s.name.includes('Corte Clásico'));
assert.strictEqual(s1?.durationMinutes, 30);
assert.strictEqual(s1?.price, 12000);

const s2 = services.find(s => s.name.includes('Perfilado y Afeitado'));
assert.strictEqual(s2?.durationMinutes, 30);
assert.strictEqual(s2?.price, 9000);

const s3 = services.find(s => s.name.includes('Combo Corte + Barba'));
assert.strictEqual(s3?.durationMinutes, 45);
assert.strictEqual(s3?.price, 18000);

const s4 = services.find(s => s.name.includes('Alisado Progresivo'));
assert.strictEqual(s4?.durationMinutes, 60);
assert.strictEqual(s4?.price, 26000);

const s5 = services.find(s => s.name.includes('Coloración / Camuflaje'));
assert.strictEqual(s5?.durationMinutes, 45);
assert.strictEqual(s5?.price, 15000);

const s6 = services.find(s => s.name.includes('Limpieza Facial'));
assert.strictEqual(s6?.durationMinutes, 20);
assert.strictEqual(s6?.price, 8000);

console.log('✓ All 6 mandatory services verified with exact durations & prices');

// 3. Verify Initial Appointments
const appointments = storageService.getAppointments();
assert.strictEqual(appointments.length >= 10, true, 'Must have at least 10 initial appointments');
assert.strictEqual(appointments.every(a => a.id.startsWith('#TUR-')), true, 'All IDs must start with #TUR-');

const today = getDateString(0);
const todayApps = appointments.filter(a => a.date === today);
assert.strictEqual(todayApps.length > 0, true, 'Must have appointments today');
console.log(`✓ Appointments verified: ${appointments.length} total, ${todayApps.length} for today (${today})`);

// 4. Verify Booking Engine Slot Generation for 60 min service
const slots60 = getAvailableTimeSlots({
  branchId: 'palermo',
  date: getDateString(3), // future date so hours haven't passed
  durationMinutes: 60,
  barberId: 'any'
});

// Slot at 19:30 should be invalid because 19:30 + 60 min = 20:30 > 20:00 closing
const slot1930 = slots60.find(s => s.time === '19:30');
assert.strictEqual(slot1930?.available, false, '19:30 slot for 60m must be unavailable');

const slot1000 = slots60.find(s => s.time === '10:00');
assert.strictEqual(slot1000?.available, true, '10:00 slot for 60m must be available on future empty date');
console.log('✓ 60-min interval calculations and closing time constraints verified');

// 5. Verify Appointment Creation
// Ensure collision test date is an active working day (Lun-Sáb) so barbershop is open
let futureWorkingOffset = 4;
while (new Date(Date.now() + futureWorkingOffset * 86400000).getDay() === 0) {
  futureWorkingOffset++;
}
const workingCollisionDate = getDateString(futureWorkingOffset);

const newApp = storageService.saveAppointment({
  branchId: 'recoleta',
  serviceId: s3.id,
  barberId: 'barber-5',
  clientName: 'Test Automation Client',
  clientPhone: '+54 9 11 9999-8888',
  date: workingCollisionDate,
  timeSlot: '11:00',
  durationMinutes: 45,
  price: s3.price,
  status: 'Confirmado',
  notes: 'E2E Automated test'
});

assert.strictEqual(newApp.id.startsWith('#TUR-'), true);
const reloaded = storageService.getAppointments().find(a => a.id === newApp.id);
assert.strictEqual(reloaded?.clientName, 'Test Automation Client');
console.log(`✓ New appointment created and saved: ${newApp.id}`);

// 6. Verify Collision for that newly booked barber at 11:00 (45m duration: 11:00 to 11:45)
const slotsCollision = getAvailableTimeSlots({
  branchId: 'recoleta',
  date: workingCollisionDate,
  durationMinutes: 30,
  barberId: 'barber-5'
});

const slot1100Coll = slotsCollision.find(s => s.time === '11:00');
assert.strictEqual(slot1100Coll?.available, false, 'Barber 5 should be busy at 11:00');

const slot1130Coll = slotsCollision.find(s => s.time === '11:30');
assert.strictEqual(slot1130Coll?.available, false, 'Barber 5 should be busy at 11:30 because 45m service ends at 11:45');

const slot1200Coll = slotsCollision.find(s => s.time === '12:00');
assert.strictEqual(slot1200Coll?.available, true, 'Barber 5 should be free at 12:00');
console.log('✓ Overlap collision verified: 11:00 and 11:30 slots blocked for 45m booking, 12:00 free');

// 7. Verify Argentine WhatsApp phone normalization
const { normalizeWhatsAppPhone } = await import('./src/services/storageService.ts');
assert.strictEqual(normalizeWhatsAppPhone('+54 9 11 4820-1122'), '5491148201122');
assert.strictEqual(normalizeWhatsAppPhone('11 5522-3344'), '5491155223344');
assert.strictEqual(normalizeWhatsAppPhone('1155223344'), '5491155223344');
console.log('✓ Argentine WhatsApp phone normalization verified');

// 8. Verify Chair Capacity Limit Enforcement for Specific Barber
// Sede Belgrano has 3 chairs (chairsCount: 3).
// If 3 appointments occupy 15:00 on day 5, even a free barber cannot take a slot:
const testDate = getDateString(5);
const mockBelgranoApps = [
  { id: '#M1', branchId: 'belgrano', barberId: 'barber-3', timeSlot: '15:00', durationMinutes: 30, date: testDate, status: 'Confirmado', price: 10000, clientName: 'C1', clientPhone: '111', serviceId: 's1', notes: '', createdAt: '' },
  { id: '#M2', branchId: 'belgrano', barberId: 'barber-4', timeSlot: '15:00', durationMinutes: 30, date: testDate, status: 'Confirmado', price: 10000, clientName: 'C2', clientPhone: '222', serviceId: 's1', notes: '', createdAt: '' },
  { id: '#M3', branchId: 'belgrano', barberId: 'other-staff', timeSlot: '15:00', durationMinutes: 30, date: testDate, status: 'Confirmado', price: 10000, clientName: 'C3', clientPhone: '333', serviceId: 's1', notes: '', createdAt: '' },
];
const chairSlots = getAvailableTimeSlots({
  branchId: 'belgrano',
  date: testDate,
  durationMinutes: 30,
  barberId: 'barber-3', // Even if barber-3 was targeted, chair capacity is maxed out!
  customAppointments: mockBelgranoApps
});
const slot1500Chair = chairSlots.find(s => s.time === '15:00');
assert.strictEqual(slot1500Chair?.available, false, 'Slot 15:00 should be blocked because all 3 chairs are full');
assert.strictEqual(slot1500Chair?.reason, 'Capacidad máxima de sillas alcanzada');
console.log('✓ Chair capacity limit enforcement verified for specific barber requests');

// 9. Verify Cross-Branch Barber Bleed Prevention
// Attempting to request Palermo barber 'barber-1' in Belgrano should fallback safely
const crossBranchSlots = getAvailableTimeSlots({
  branchId: 'belgrano',
  date: getDateString(6),
  durationMinutes: 30,
  barberId: 'barber-1' // Facundo Gómez belongs to Palermo, not Belgrano!
});
const crossSlot = crossBranchSlots.find(s => s.available);
assert.notStrictEqual(crossSlot?.assignedBarberId, 'barber-1', 'Cross-branch barber should not be assigned');
console.log('✓ Cross-branch barber booking prevention verified');

// 10. Verify No Asistió status representation and revenue exclusion
const allApps = storageService.getAppointments();
const noShowApp = allApps.find(a => a.status === 'No Asistió');
assert.strictEqual(!!noShowApp, true, 'Mock dataset should contain a No Asistió appointment');
console.log(`✓ Appointment status 'No Asistió' confirmed in dataset: ${noShowApp?.id}`);

console.log('\n--- ALL E2E AND PERSISTENCE TESTS PASSED ---');
