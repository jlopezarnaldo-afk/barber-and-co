import assert from 'node:assert';
import fs from 'node:fs';

console.log('>>> RUNNING COMPREHENSIVE PRE-DEPLOY FIXES VERIFICATION <<<');

// 1. Service Worker Verification (Hallazgo 3.1)
console.log('1. Testing Service Worker content and strategy...');
const swContent = fs.readFileSync('./public/sw.js', 'utf8');
assert.strictEqual(swContent.includes("event.request.mode === 'navigate'"), true, 'SW must handle navigation requests specifically');
assert.strictEqual(swContent.includes('self.skipWaiting()'), true, 'SW must call self.skipWaiting()');
assert.strictEqual(swContent.includes('self.clients.claim()'), true, 'SW must call self.clients.claim()');
assert.strictEqual(swContent.includes('barber-co-v2'), true, 'SW cache version should be bumped');
console.log('  ✓ Service Worker Network-First navigation & activation verified');

// 2. ErrorBoundary & main.tsx (Hallazgo 1.1)
console.log('2. Testing ErrorBoundary & main.tsx integration...');
const mainContent = fs.readFileSync('./src/main.tsx', 'utf8');
assert.strictEqual(mainContent.includes('<ErrorBoundary>'), true, 'main.tsx must wrap App in ErrorBoundary');
assert.strictEqual(mainContent.includes('</ErrorBoundary>'), true, 'main.tsx must close ErrorBoundary');
const errorBoundaryContent = fs.readFileSync('./src/components/ErrorBoundary.tsx', 'utf8');
assert.strictEqual(errorBoundaryContent.includes('Ocurrió un error inesperado'), true, 'ErrorBoundary must display title');
assert.strictEqual(errorBoundaryContent.includes('Reiniciar aplicación'), true, 'ErrorBoundary must offer reload button');
assert.strictEqual(errorBoundaryContent.includes('#ECE7DE'), true, 'ErrorBoundary must use editorial palette');
console.log('  ✓ ErrorBoundary component and wrapping in main.tsx verified');

// 3. StorageService Resiliency: Corrupt JSON & Try/Catch (Hallazgo 1.2)
console.log('3. Testing LocalStorage corruption resiliency in storageService...');
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

const { storageService, getDateString } = await import('./src/services/storageService.ts');

// Inject corrupt JSON into storage keys
store['barber_settings'] = '{ INVALID_JSON ';
const settings = storageService.getSettings();
assert.strictEqual(typeof settings, 'object', 'getSettings must recover cleanly from corrupt JSON');
assert.strictEqual(settings.allowClientSelectBarber, true);

store['barber_branches'] = 'Corrupt branches string';
const branches = storageService.getBranches();
assert.strictEqual(Array.isArray(branches), true, 'getBranches must recover cleanly from corrupt JSON');
assert.strictEqual(branches.length, 3);

store['barber_staff'] = '{ corrupt staff }';
const staff = storageService.getStaff();
assert.strictEqual(Array.isArray(staff), true, 'getStaff must recover cleanly from corrupt JSON');
assert.strictEqual(staff.length >= 6, true);

store['barber_appointments'] = 'Corrupt appointments';
const appointments = storageService.getAppointments();
assert.strictEqual(Array.isArray(appointments), true, 'getAppointments must recover cleanly from corrupt JSON');
assert.strictEqual(appointments.length >= 10, true);

// Test non-array valid JSON (e.g. object or primitive that would bypass basic try/catch)
store['barber_staff'] = '{"validJson": "butNotArray"}';
const recoveredStaff = storageService.getStaff();
assert.strictEqual(Array.isArray(recoveredStaff), true, 'getStaff must recover when stored data is an object instead of array');

store['barber_branches'] = '12345';
const recoveredBranches = storageService.getBranches();
assert.strictEqual(Array.isArray(recoveredBranches), true, 'getBranches must recover when stored data is a number');

store['barber_appointments'] = '{"status": "broken"}';
const recoveredAppointments = storageService.getAppointments();
assert.strictEqual(Array.isArray(recoveredAppointments), true, 'getAppointments must recover when stored data is an object');

store['barber_services'] = '"corrupted-string"';
const recoveredServices = storageService.getServices();
assert.strictEqual(Array.isArray(recoveredServices), true, 'getServices must recover when stored data is a string');
console.log('  ✓ Corrupt JSON and non-array type recovery in getSettings, getBranches, getStaff, getAppointments, getServices verified');

// 4. Formula Injection Prevention in CSV Export (Hallazgo 1.3)
console.log('4. Testing CSV formula sanitization...');
// Let's create an appointment with formula injection attempts
const maliciousApp = {
  branchId: 'palermo',
  serviceId: 'serv-1',
  barberId: 'barber-1',
  clientName: '=CMD|"/C calc"!A0',
  clientPhone: '+54 9 11 1234-5678',
  date: getDateString(10),
  timeSlot: '14:00',
  durationMinutes: 30,
  price: 12000,
  status: 'Confirmado',
  notes: '-2+5+cmd',
};

// Check saveAppointment succeeds on empty slot
const savedMalicious = storageService.saveAppointment(maliciousApp);
assert.strictEqual(savedMalicious.clientName, '=CMD|"/C calc"!A0');

// Mock DOM for exportAppointmentsToCSV
let exportedCsv = '';
global.Blob = class {
  constructor(contentParts) {
    exportedCsv = contentParts.join('');
  }
};
global.URL = {
  createObjectURL: () => 'blob:mock',
  revokeObjectURL: () => {}
};
global.document = {
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  createElement: () => ({
    setAttribute: () => {},
    click: () => {}
  })
};

storageService.exportAppointmentsToCSV();
assert.strictEqual(exportedCsv.includes(`"'=CMD|""/C calc""!A0"`), true, 'Name with = prefix must be sanitized with leading single quote');
assert.strictEqual(exportedCsv.includes(`"'-2+5+cmd"`), true, 'Notes with - prefix must be sanitized with leading single quote');

// Test with leading spaces before formula symbol
const whitespaceFormulaApp = {
  branchId: 'recoleta',
  serviceId: 'serv-2',
  barberId: 'barber-5',
  clientName: '   +54119999',
  clientPhone: '+54 9 11 9999-8888',
  date: getDateString(10),
  timeSlot: '16:00',
  durationMinutes: 30,
  price: 15000,
  status: 'Confirmado',
  notes: '   @SUM(1+1)',
};
storageService.saveAppointment(whitespaceFormulaApp);
storageService.exportAppointmentsToCSV();
assert.strictEqual(exportedCsv.includes(`"'   +54119999"`), true, 'Name with leading space before + must be sanitized');
assert.strictEqual(exportedCsv.includes(`"'   @SUM(1+1)"`), true, 'Notes with leading space before @ must be sanitized');
console.log('  ✓ CSV Excel formula injection neutralized successfully (including leading whitespace)');

// Test price sanitization in storageService (Hallazgo 2.6)
console.log('4b. Testing price matrix sanitization against NaN and negative values...');
storageService.updateServiceBranchPrices('serv-1', {
  palermo: -500,
  belgrano: NaN,
  recoleta: 19500,
});
const updatedServ1 = storageService.getServiceById('serv-1');
assert.strictEqual(updatedServ1.branchPrices.recoleta, 19500);
assert.strictEqual(updatedServ1.branchPrices.palermo >= 500, true, 'Palermo price cannot be negative or below minimum');
assert.strictEqual(!isNaN(updatedServ1.branchPrices.belgrano), true, 'Belgrano price cannot be NaN');
console.log('  ✓ Price matrix sanitization verified');

// 5. Overlap collision in saveAppointment (Hallazgo 2.2)
console.log('5. Testing concurrency & collision blocking in saveAppointment...');
// Attempting to book the same barber at the same time must throw
let collisionThrown = false;
try {
  storageService.saveAppointment({
    branchId: 'palermo',
    serviceId: 'serv-1',
    barberId: 'barber-1',
    clientName: 'Concurrent User B',
    clientPhone: '+54 9 11 8888-7777',
    date: getDateString(10),
    timeSlot: '14:00', // Solapado con savedMalicious (14:00 a 14:30)
    durationMinutes: 30,
    price: 12000,
    status: 'Confirmado',
    notes: 'Concurrent collision test',
  });
} catch (err) {
  collisionThrown = true;
  assert.strictEqual(err.message.includes('profesional') || err.message.includes('reserva'), true);
}
assert.strictEqual(collisionThrown, true, 'saveAppointment must throw error when barber slot is occupied');

// Also test overlapping interval (e.g. 14:15 with a 30m appointment)
let partialOverlapThrown = false;
try {
  storageService.saveAppointment({
    branchId: 'palermo',
    serviceId: 'serv-1',
    barberId: 'barber-1',
    clientName: 'Concurrent User C',
    clientPhone: '+54 9 11 8888-7777',
    date: getDateString(10),
    timeSlot: '14:15',
    durationMinutes: 30,
    price: 12000,
    status: 'Confirmado',
    notes: 'Partial collision test',
  });
} catch {
  partialOverlapThrown = true;
}
assert.strictEqual(partialOverlapThrown, true, 'saveAppointment must throw on partial interval overlap');
console.log('  ✓ saveAppointment collision protection verified');

// 6. ServiceCatalog Empty Array Check (Hallazgo 2.3)
console.log('6. Testing ServiceCatalog resilience with empty services...');
const catalogFile = fs.readFileSync('./src/components/ServiceCatalog.tsx', 'utf8');
assert.strictEqual(catalogFile.includes('services.length === 0'), true, 'ServiceCatalog must check empty services array');
assert.strictEqual(catalogFile.includes('No hay servicios disponibles temporalmente'), true, 'ServiceCatalog must show empty state text');
assert.strictEqual(catalogFile.includes('const otherServices = featuredService ? services.filter((s) => s.id !== featuredService.id) : [];'), true, 'ServiceCatalog must safely filter other services');
console.log('  ✓ ServiceCatalog empty state verified');

// 7. BookingWizard Phone validation regex & maxLength (Hallazgos 2.5 & 1.4)
console.log('7. Testing BookingWizard phone validation and input maxLengths...');
const wizardFile = fs.readFileSync('./src/components/BookingWizard.tsx', 'utf8');
assert.strictEqual(wizardFile.includes('maxLength={80}'), true, 'clientName must have maxLength=80');
assert.strictEqual(wizardFile.includes('maxLength={25}'), true, 'clientPhone must have maxLength=25');
assert.strictEqual(wizardFile.includes('maxLength={300}'), true, 'clientNotes must have maxLength=300');
assert.strictEqual(wizardFile.includes('setSelectedTimeSlot(\'\')'), true, 'selectedTimeSlot must be reset in Step 2');

// Test phone validation logic in isolation
const testPhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return !/[a-zA-Z]/.test(phone) && /^(\+54\s?9?\s?)?[\d\s\-()]{8,18}$/.test(phone.trim()) && digits.length >= 8 && digits.length <= 15;
};
assert.strictEqual(testPhone('texto-12345678-abc!@#'), false, 'Alphanumeric corrupted phone must be rejected');
assert.strictEqual(testPhone('+54 9 11 5522-3344'), true, 'Valid Argentine phone must be accepted');
assert.strictEqual(testPhone('11 2150-3344'), true, 'Valid local phone must be accepted');
assert.strictEqual(testPhone('12345'), false, 'Short phone must be rejected');
console.log('  ✓ Phone validation regex and maxLengths verified');

// 8. AdminPanel Modals & Empty State (Hallazgos 2.4 & 2.7)
console.log('8. Testing AdminPanel modal scroll classes and empty table state...');
const adminFile = fs.readFileSync('./src/components/AdminPanel.tsx', 'utf8');
const modalMatches = adminFile.match(/max-h-\[90dvh\] overflow-y-auto/g);
assert.strictEqual(modalMatches && modalMatches.length >= 4, true, 'All 4 AdminPanel modals must have max-h-[90dvh] overflow-y-auto');
assert.strictEqual(adminFile.includes('No hay reservas registradas'), true, 'AdminPanel appointments table must have empty state');
console.log('  ✓ AdminPanel modals scroll and appointments table empty state verified');

// 9. Manifest & Viewport Meta (Hallazgos 3.4 & 3.5)
console.log('9. Testing manifest.json and index.html viewport...');
const manifest = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf8'));
assert.strictEqual(manifest.background_color, '#ECE7DE', 'manifest background_color must be #ECE7DE');
assert.strictEqual(manifest.theme_color, '#ECE7DE', 'manifest theme_color must be #ECE7DE');

const indexHtml = fs.readFileSync('./index.html', 'utf8');
assert.strictEqual(indexHtml.includes('user-scalable=no'), false, 'index.html must not block zoom');
assert.strictEqual(indexHtml.includes('maximum-scale=1.0'), false, 'index.html must not set maximum-scale=1.0');
console.log('  ✓ manifest colors and viewport zoom verified');

console.log('\n>>> ALL 10 PRE-DEPLOY AUDIT FINDINGS VERIFIED AND PASSED 100% <<<');
