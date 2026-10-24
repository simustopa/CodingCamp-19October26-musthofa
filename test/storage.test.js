// Storage Adapter tests for Task 2.1.
//
// Covers isStorageAvailable / loadJSON / saveJSON from js/app.js with a mix of
// property-based tests (fast-check, >=100 iterations per property) and
// edge-case/unit tests. The happy-dom environment provides a working
// localStorage; failures are simulated with vi.spyOn / vi.stubGlobal.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { isStorageAvailable, loadJSON, saveJSON } from '../js/app.js';

// Namespaced test key so we never collide with real app keys ('tld.tasks',
// 'tld.links') or the adapter's own probe key.
const KEY = 'tld.test.key';
const PROBE_KEY = '__tld_storage_test__';

// Sentinel fallback used by the round-trip property so a bug that wrongly
// returns the fallback (instead of the saved value) is caught.
const ROUNDTRIP_FALLBACK = { __roundtrip_fallback__: true };

// ---- fast-check generators ------------------------------------------------

// Varied, deeply-comparable fallbacks used by the "no data -> fallback"
// properties (Req 4.8 / Property 17).
const fallbackArb = fc.oneof(
  fc.constant([]),
  fc.constant({}),
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.constant(null)
);

// Representations of "no data" that must all load as the fallback (empty
// collection): a missing key, an empty string, a stored JSON null, and the
// string "undefined" (what setItem(key, undefined) coerces to).
const noDataArb = fc.oneof(
  fc.constant({ stored: false }),
  fc.constant({ stored: true, value: '' }),
  fc.constant({ stored: true, value: 'null' }),
  fc.constant({ stored: true, value: 'undefined' })
);

// Strings that are guaranteed NOT valid JSON (Property 17: malformed JSON).
const malformedArb = fc.string().filter((s) => {
  try {
    JSON.parse(s);
    return false;
  } catch {
    return true;
  }
});

// JSON-serializable values that survive a save/load round-trip. Excludes
// top-level null/undefined (the adapter treats stored null as "no data") and
// avoids NaN / Infinity / -0 (which do not round-trip faithfully). Includes
// the app's real persisted shapes: task lists and link lists.
const jsonArb = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.array(fc.integer()),
  fc.array(fc.string()),
  fc.record({ id: fc.string(), text: fc.string(), done: fc.boolean() }),
  fc.array(fc.record({ id: fc.string(), text: fc.string(), done: fc.boolean() })),
  fc.record({ id: fc.string(), name: fc.string(), url: fc.string() }),
  fc.array(fc.record({ id: fc.string(), name: fc.string(), url: fc.string() })),
  fc.record({ nested: fc.array(fc.integer()), flag: fc.boolean() })
);

// ---- shared setup / teardown ---------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ---- isStorageAvailable ---------------------------------------------------

describe('isStorageAvailable', () => {
  it('returns true when localStorage works (happy-dom)', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it('returns false when localStorage is undefined entirely', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(isStorageAvailable()).toBe(false);
  });

  it('returns false when setItem throws (e.g., Safari private mode)', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(isStorageAvailable()).toBe(false);
  });

  it('returns false when getItem throws', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(isStorageAvailable()).toBe(false);
  });

  it('returns false when removeItem throws', () => {
    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(isStorageAvailable()).toBe(false);
  });

  it('cleans up its probe key after a successful probe', () => {
    isStorageAvailable();
    expect(localStorage.getItem(PROBE_KEY)).toBeNull();
  });
});

// ---- saveJSON -------------------------------------------------------------

describe('saveJSON', () => {
  it('returns { ok: true } and persists the JSON-serialized value', () => {
    expect(saveJSON(KEY, { a: 1 })).toEqual({ ok: true });
    expect(localStorage.getItem(KEY)).toBe('{"a":1}');
  });

  it('returns { ok: false, error } when setItem throws', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const res = saveJSON(KEY, { a: 1 });
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(Error);
  });

  it('returns { ok: false, error } when JSON.stringify throws (circular reference)', () => {
    const circular = {};
    circular.self = circular;
    const res = saveJSON(KEY, circular);
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(Error);
  });

  it('returns { ok: false, error } when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    const res = saveJSON(KEY, { a: 1 });
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(Error);
  });
});

// ---- loadJSON -------------------------------------------------------------

describe('loadJSON', () => {
  it('returns the same fallback reference for a missing key', () => {
    const fallback = [];
    expect(loadJSON(KEY, fallback)).toBe(fallback);
  });

  it('returns the fallback for an empty stored string', () => {
    localStorage.setItem(KEY, '');
    expect(loadJSON(KEY, 'fb')).toBe('fb');
  });

  it('returns the fallback for a stored JSON null', () => {
    localStorage.setItem(KEY, 'null');
    expect(loadJSON(KEY, 'fb')).toBe('fb');
  });

  it('returns the fallback for a stored "undefined" string', () => {
    localStorage.setItem(KEY, 'undefined');
    expect(loadJSON(KEY, 'fb')).toBe('fb');
  });

  it('returns the parsed value for valid stored JSON', () => {
    saveJSON(KEY, { a: 1, b: [2, 3] });
    expect(loadJSON(KEY, null)).toEqual({ a: 1, b: [2, 3] });
  });

  it('returns the fallback when storage getItem throws', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(loadJSON(KEY, 'fb')).toBe('fb');
  });

  it('returns the fallback when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadJSON(KEY, 'fb')).toBe('fb');
  });

  // Feature: todo-life-dashboard, Property 17: Missing stored link set loads as empty
  it('PBT: returns the fallback for any no-data representation (missing/empty/null/undefined)', () => {
    fc.assert(
      fc.property(noDataArb, fallbackArb, (scenario, fallback) => {
        if (scenario.stored) {
          localStorage.setItem(KEY, scenario.value);
        } else {
          localStorage.removeItem(KEY);
        }
        expect(loadJSON(KEY, fallback)).toEqual(fallback);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todo-life-dashboard, Property 17: Missing stored link set loads as empty
  it('PBT: returns the fallback for arbitrary malformed JSON strings', () => {
    fc.assert(
      fc.property(malformedArb, fallbackArb, (s, fallback) => {
        localStorage.setItem(KEY, s);
        expect(loadJSON(KEY, fallback)).toEqual(fallback);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todo-life-dashboard, Property 13 & 16: Round-trip through Local Storage preserves values
  it('PBT: saveJSON + loadJSON round-trip preserves arbitrary JSON-serializable values', () => {
    fc.assert(
      fc.property(jsonArb, (value) => {
        const res = saveJSON(KEY, value);
        expect(res).toEqual({ ok: true });
        // The sentinel fallback must NOT come back: valid data loads itself.
        expect(loadJSON(KEY, ROUNDTRIP_FALLBACK)).toEqual(value);
      }),
      { numRuns: 100 }
    );
  });

  it('round-trips diverse JSON-serializable values including app data shapes (edge cases)', () => {
    const values = [
      { a: 1, b: 'x', c: true, nested: { arr: [1, 2, { k: 'v' }] } },
      [],
      [1, 2, 3],
      // A task list, matching the app's persisted shape (Req 3.8).
      [
        { id: 't1', text: 'Write design doc', done: false },
        { id: 't2', text: 'Review PR', done: true }
      ],
      // A link set, matching the app's persisted shape (Req 4.7).
      [{ id: 'l1', name: 'Search', url: 'https://example.com' }],
      '',
      'hello world',
      'with "quotes" and \\ backslash',
      'emoji 🎉 and unicode ñ',
      0,
      42,
      -7,
      3.14,
      true,
      false
    ];
    for (const value of values) {
      expect(saveJSON(KEY, value)).toEqual({ ok: true });
      expect(loadJSON(KEY, null)).toEqual(value);
    }
  });
});
