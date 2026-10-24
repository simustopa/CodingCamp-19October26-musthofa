// Vitest configuration for the To-Do List Life Dashboard.
//
// Tests live in the `test/` directory at the project root, outside `js/` and
// `css/`, and import the pure functions exported from `js/app.js`. Because
// `app.js` guards its `init()` with `typeof document !== 'undefined'`,
// importing it under Node runs no DOM code, so pure-logic tests need no DOM.
//
// Controller-layer integration tests that touch `document` run under the
// lightweight `happy-dom` environment. Run a single pass with:
//   npx vitest run
//
// This file is an ES module (package.json sets "type": "module").

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Point Vitest at the test/ directory at the project root.
    directory: 'test',
    include: ['test/**/*.test.js'],
    // Lightweight DOM emulation for controller-layer integration tests.
    environment: 'happy-dom',
  },
});
