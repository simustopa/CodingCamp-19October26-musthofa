import fc from 'fast-check';

// Inspect jsonValue: does it produce values (not strings)? Does it include top-level null?
const sample = [];
for (let i = 0; i < 200; i++) {
  sample.push(fc.sample(fc.jsonValue(), 1)[0]);
}
const types = new Set(sample.map((v) => typeof v));
console.log('jsonValue typeofs:', [...types]);
console.log('has top-level null:', sample.some((v) => v === null));
console.log('has undefined:', sample.some((v) => v === undefined));
console.log('sample[0]:', JSON.stringify(sample[0]));
console.log('sample[1]:', JSON.stringify(sample[1]));

// Confirm round-trip of jsonValue values that are not top-level null
let roundtripFail = 0;
let nullCount = 0;
for (let i = 0; i < 500; i++) {
  const v = fc.sample(fc.jsonValue(), 1)[0];
  if (v === null) { nullCount++; continue; }
  const s = JSON.stringify(v);
  const back = JSON.parse(s);
  if (JSON.stringify(back) !== s) roundtripFail++;
}
console.log('roundtrip mismatches (excluding top-level null):', roundtripFail, 'nullCount:', nullCount);

// fc.string options check
try {
  const s = fc.sample(fc.string({ minLength: 1, maxLength: 10 }), 1)[0];
  console.log('fc.string with minLength/maxLength OK, sample:', JSON.stringify(s));
} catch (e) {
  console.log('fc.string options error:', e.message);
}

// malformed json generator check
const malformed = fc.sample(fc.string().map((s) => '[' + JSON.stringify(s) + ',]'), 50);
let malformedOk = malformed.every((s) => { try { JSON.parse(s); return false; } catch { return true; } });
console.log('malformed generator always invalid:', malformedOk);
