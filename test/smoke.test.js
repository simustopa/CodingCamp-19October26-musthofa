import { describe, it, expect } from 'vitest';
import { makeId } from '../js/app.js';

describe('Task 1 smoke test - infrastructure verification', () => {
  it('makeId returns a non-empty string', () => {
    const id = makeId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('makeId generates unique ids across 100 calls', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) ids.add(makeId());
    expect(ids.size).toBe(100);
  });

  it('index.html links css and js as module', async () => {
    const fs = await import('node:fs');
    const html = fs.readFileSync('index.html', 'utf-8');
    expect(html).toContain('css/style.css');
    expect(html).toContain('type="module"');
    expect(html).toContain('js/app.js');
  });

  it('package.json has required devDependencies', async () => {
    const fs = await import('node:fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    expect(pkg.devDependencies).toHaveProperty('vitest');
    expect(pkg.devDependencies).toHaveProperty('fast-check');
    expect(pkg.devDependencies).toHaveProperty('happy-dom');
  });

  it('vitest.config.js points at test directory with happy-dom', async () => {
    const fs = await import('node:fs');
    const config = fs.readFileSync('vitest.config.js', 'utf-8');
    expect(config).toContain("directory: 'test'");
    expect(config).toContain("environment: 'happy-dom'");
  });
});