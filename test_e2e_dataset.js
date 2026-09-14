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
const newApp = storageService.saveAppointment({
  branchId: 'recoleta',
  serviceId: s3.id,
  barberId: 'barber-5',
  clientName: 'Test Automation Client',
  clientPhone: '+54 9 11 9999-8888',
  date: getDateString(4),
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
  date: getDateString(4),
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

console.log('\n--- ALL E2E AND PERSISTENCE TESTS PASSED ---');
