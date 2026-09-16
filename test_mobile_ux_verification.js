import assert from 'node:assert';
import fs from 'node:fs';

console.log('>>> RUNNING COMPREHENSIVE MOBILE UX & WIZARD SCROLL VERIFICATION <<<');

const wizardCode = fs.readFileSync('./src/components/BookingWizard.tsx', 'utf8');
const appCode = fs.readFileSync('./src/App.tsx', 'utf8');

// 1. Check for autoFocus in steps 2, 3, 4
console.log('1. Checking for autoFocus in inputs...');
assert.strictEqual(
  wizardCode.includes('autoFocus'),
  false,
  'BookingWizard must not contain any autoFocus attributes'
);
assert.strictEqual(
  wizardCode.includes('autofocus'),
  false,
  'BookingWizard must not contain any autofocus attributes'
);
console.log('  ✓ No uncontrolled autoFocus found in BookingWizard');

// 2. Check wizardRef and explicit scrollIntoView
console.log('2. Checking wizardRef and scrollIntoView implementation...');
assert.strictEqual(
  wizardCode.includes('const wizardRef = useRef<HTMLDivElement>(null);'),
  true,
  'wizardRef must be declared as useRef<HTMLDivElement>(null)'
);
assert.strictEqual(
  wizardCode.includes('ref={wizardRef}'),
  true,
  'ref={wizardRef} must be attached to the root wizard grid container'
);
assert.strictEqual(
  wizardCode.includes('scroll-mt-20'),
  true,
  'wizardRef container must have scroll-mt-20 to clear the 64px sticky navbar'
);
assert.strictEqual(
  wizardCode.includes('scrollIntoView({'),
  true,
  'scrollIntoView must be called with options object'
);
assert.strictEqual(
  wizardCode.includes("block: 'start'"),
  true,
  "scrollIntoView must specify block: 'start'"
);
assert.strictEqual(
  wizardCode.includes('prefers-reduced-motion'),
  true,
  'scrollIntoView must respect prefers-reduced-motion for accessibility'
);
console.log('  ✓ wizardRef and explicit scrollIntoView correctly implemented');

// 3. Check virtual keyboard handling & post-navigation alignment
console.log('3. Checking virtual keyboard dismissal and double-frame alignment...');
assert.strictEqual(
  wizardCode.includes('document.activeElement.blur()'),
  true,
  'goToStep must blur activeElement to dismiss software keyboard before transition'
);
assert.strictEqual(
  wizardCode.includes('requestAnimationFrame'),
  true,
  'goToStep must re-align scroll on animation frame after React commits new DOM'
);
console.log('  ✓ Virtual keyboard dismissal and post-render alignment verified');

// 4. Check desktop-only focus logic with fine pointer guard
console.log('4. Checking desktop-only focus isolation...');
assert.strictEqual(
  wizardCode.includes('nameInputRef.current?.focus({ preventScroll: true })'),
  true,
  'Focus must use { preventScroll: true }'
);
assert.strictEqual(
  wizardCode.includes("window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')"),
  true,
  'Focus must require desktop width, hover, and fine pointer (never mobile or touch)'
);
console.log('  ✓ Desktop-only focus isolation verified');

// 5. Check iOS Safari auto-zoom prevention (16px text-base on mobile)
console.log('5. Checking font-size on Step 4 inputs...');
const inputMatches = wizardCode.match(/text-base sm:text-sm/g);
assert.strictEqual(
  inputMatches && inputMatches.length >= 3,
  true,
  'All 3 client inputs (name, phone, notes) must use text-base sm:text-sm to prevent iOS Safari auto-zoom'
);
console.log('  ✓ iOS Safari auto-zoom prevention verified across all inputs');

// 6. Check dynamic viewport height (min-h-dvh)
console.log('6. Checking min-h-dvh dynamic viewport height...');
assert.strictEqual(
  wizardCode.includes('min-h-dvh'),
  true,
  'BookingWizard section must include min-h-dvh'
);
assert.strictEqual(
  appCode.includes('min-h-dvh'),
  true,
  'App root container must include min-h-dvh'
);
console.log('  ✓ min-h-dvh dynamic viewport sizing verified');

// 7. Check transition and layout stability
console.log('7. Checking layout shift mitigations and transitions...');
assert.strictEqual(
  wizardCode.includes('min-h-[480px]'),
  true,
  'Step container must enforce min-h-[480px] to avoid layout collapsing'
);
assert.strictEqual(
  wizardCode.includes('selectedTimeSlot && (\n                  <div className="mt-3 p-3 bg-[#ECE7DE] border border-[#141210]/20 rounded-[2px] flex items-center justify-between text-xs text-[#141210] animate-fadeIn">'),
  true,
  'Time slot banner must have animate-fadeIn'
);
assert.strictEqual(
  wizardCode.includes('animate-fadeIn') && wizardCode.includes('bg-rose-50/90'),
  true,
  'Form error message must have animate-fadeIn'
);
console.log('  ✓ Layout shift mitigations and smooth transitions verified');

// 8. Verify all navigation routes through goToStep
console.log('8. Verifying all step buttons invoke goToStep...');
const stepButtonOccurrences = wizardCode.match(/goToStep\(/g);
// Step 1 cont, Step 2 back, Step 2 cont, Step 3 back, Step 3 cont, Step 4 back, Step 4 error (x2), Step 4 success, Step 5 reset, sidebar (x1)
assert.strictEqual(
  stepButtonOccurrences && stepButtonOccurrences.length >= 10,
  true,
  `All step navigations must route through goToStep (found ${stepButtonOccurrences?.length})`
);
console.log(`  ✓ All ${stepButtonOccurrences.length} step transitions route through goToStep`);

console.log('\n>>> ALL MOBILE UX & WIZARD SCROLL VERIFICATION CHECKS PASSED 100% <<<');
