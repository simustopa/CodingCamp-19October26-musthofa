# Implementation Plan: To-Do List Life Dashboard

## Overview

The implementation follows the layered architecture from the design document: a Pure Logic Layer (stateless functions for formatting, validation, timer state, and serialization), a Storage Adapter (localStorage wrapper with try/catch and failure handling), a Controller/DOM Layer (event binding and rendering), and a guarded Bootstrap (`init()` on `DOMContentLoaded`).

All application JavaScript lives in a single file `js/app.js` (loaded as an ES module so pure functions can be imported by Node-based tests). Tests live in a `test/` directory at the project root using Vitest + fast-check + happy-dom as dev dependencies. Pure-logic functions are implemented and property-tested first, then the HTML/CSS shell is built, and finally the controller/DOM layer wires everything together.

## Tasks

- [x] 1. Set up project structure and test infrastructure
  - [x] 1.1 Create project structure, stub files, and shared utilities
    - Create `index.html` linking `css/style.css` and `js/app.js` (as `<script type="module">`)
    - Create `js/app.js` as an ES module with a guarded `init()` (`typeof document !== 'undefined'` check at top level)
    - Add `makeId()` utility function (`crypto.randomUUID()` with `Date.now`+`Math.random` fallback)
    - Create `css/style.css` placeholder
    - Create `test/` directory at project root
    - _Requirements: TC-1, TC-3_

  - [x] 1.2 Configure test tooling as dev dependencies
    - Create `package.json` with `vitest`, `fast-check`, and `happy-dom` as devDependencies
    - Create `vitest.config.js` pointing at `test/` directory with `happy-dom` environment for integration tests
    - Dev dependencies only — does not alter the production folder rule of one CSS in `css/` and one JS in `js/`
    - _Requirements: TC-1, NFR-1_

- [~] 2. Implement Storage Adapter
  - [-] 2.1 Implement isStorageAvailable, loadJSON, saveJSON in js/app.js
    - `isStorageAvailable()`: trial `setItem`/`getItem`/`removeItem` inside try/catch; returns false when writes throw (private mode)
    - `loadJSON(key, fallback)`: reads and `JSON.parse`s key; returns `fallback` on missing/`null`/malformed data or any throw
    - `saveJSON(key, value)`: `JSON.stringify`s and writes inside try/catch; returns `{ ok: true }` or `{ ok: false, error }`, never throws
    - Export all three functions
    - _Requirements: 3.6, 3.10, 4.5, 4.8_

 

- [ ] 3. Implement Greeting Widget pure logic
  - [ ] 3.1 Implement formatTime, formatDate, getGreeting in js/app.js
    - `formatTime(date)`: returns `"HH:MM"` 24-hour zero-padded string
    - `formatDate(date)`: returns a string containing the numeric day, month, and year
    - `getGreeting(hour)`: maps hour 0–23 to `"Good evening"` (0–4, 17–23), `"Good morning"` (5–11), `"Good afternoon"` (12–16)
    - Export all three functions
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7_


- [ ] 4. Implement Focus Timer pure logic
  - [ ] 4.1 Implement createTimerState, formatTimer, tick, start, stop, reset in js/app.js
    - `createTimerState()`: returns `{ remainingMs: 1500000, status: 'idle' }` (25 minutes)
    - `formatTimer(remainingMs)`: returns zero-padded `"MM:SS"` for non-negative remaining time
    - `tick(state)`: decrements `remainingMs` by 1000 while `running`; at/below 1000 ms converges to `0` and transitions to `finished`; no change otherwise
    - `start(state)`: begins from `idle`/`paused`; no-op when `running` or `finished`
    - `stop(state)`: pauses a `running` countdown, retaining `remainingMs`
    - `reset(state)`: restores `{ remainingMs: 1500000, status: 'idle' }`; idempotent
    - Export all functions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_





- [ ] 5. Implement To-Do List pure logic
  - [ ] 5.1 Implement validateTaskText, createTask, toggleTask, editTask, deleteTask, serializeTasks, deserializeTasks in js/app.js
    - `validateTaskText(text)`: valid iff `text.trim()` is non-empty and `text.length <= 200`
    - `createTask(text)`: builds `{ id: makeId(), text, done: false }`
    - `toggleTask(task)`: returns a new task with `done` flipped
    - `editTask(task, newText)`: returns `{ ok: true, task }` when valid (text updated, `done` unchanged); `{ ok: false, reason }` when invalid (original retained by caller)
    - `deleteTask(list, id)`: returns list without the matching id, preserving order of the rest
    - `serializeTasks(list)`: `JSON.stringify` the list (preserves array order)
    - `deserializeTasks(json)`: `JSON.parse` to a list; returns `[]` on `null`/missing/malformed
    - Export all functions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9_


- [ ] 6. Implement Quick Links pure logic
  - [ ] 6.1 Implement validateLink, createLink, deleteLink, serializeLinks, deserializeLinks in js/app.js
    - `validateLink(name, url)`: valid iff `name.trim()` non-empty, `name.length <= 100`, and `url` starts with `http://` or `https://`
    - `createLink(name, url)`: builds `{ id: makeId(), name, url }`
    - `deleteLink(list, id)`: removes matching id, preserving order of the rest
    - `serializeLinks(list)`: `JSON.stringify` the list
    - `deserializeLinks(json)`: `JSON.parse` to a list; returns `[]` on `null`/missing/malformed
    - Export all functions
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7, 4.8_


- [ ] 7. Checkpoint - Ensure all pure-logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Build HTML structure and CSS styling
  - [ ] 8.1 Create index.html dashboard layout
    - Semantic HTML with four sections: greeting, focus timer, to-do list, quick links
    - Greeting section: containers for time, date, and greeting text
    - Timer section: display element and Start/Stop/Reset buttons
    - To-do section: text input, submit button, task list container (each task has text, complete toggle, edit, delete controls)
    - Links section: name input, URL input, add button, link button container (each link has a button and remove control)
    - Link `css/style.css` and load `js/app.js` as `<script type="module">`
    - _Requirements: TC-1, NFR-1, NFR-3_

  - [ ] 8.2 Create css/style.css with clean minimal styling
    - Clean, minimal, user-friendly aesthetic with clear visual hierarchy
    - Readable typography and responsive layout for the four widget sections
    - Non-blocking error indication styling (inline messages near widgets)
    - _Requirements: NFR-1, NFR-3_

- [ ] 9. Implement Greeting Widget controller/DOM layer
  - [ ] 9.1 Implement startGreeting in js/app.js
    - Render current time, date, and greeting into DOM elements using `formatTime`, `formatDate`, `getGreeting`
    - Register a 1-second `Clock_Tick` interval (`setInterval`) that re-renders all three
    - Null-check root element, return early if absent
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_


- [ ] 10. Implement Focus Timer controller/DOM layer
  - [ ] 10.1 Implement initTimer in js/app.js
    - Bind Start/Stop/Reset buttons to DOM controls
    - Start: call `start(state)` then drive `tick` via a 1-second `setInterval`
    - Stop: call `stop(state)` and clear the interval (retain remaining time)
    - Reset: call `reset(state)` and clear the interval
    - Update DOM display with `formatTimer` on each tick and on control clicks
    - Null-check root element
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

 

- [ ] 11. Implement To-Do List controller/DOM layer
  - [ ] 11.1 Implement initTodo in js/app.js
    - Load saved tasks from `loadJSON('tld.tasks', [])` on startup and render
    - Bind add control: `validateTaskText` then `createTask`, render updated list, persist via `saveJSON`
    - Bind complete control: `toggleTask`, render, persist
    - Bind edit control: `editTask`, render on success or show error indication on failure, persist on success
    - Bind delete control: `deleteTask`, render, persist
    - On `saveJSON` failure: retain in-memory list and display non-blocking error indication
    - Null-check root element
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9, 3.10_



- [ ] 12. Implement Quick Links controller/DOM layer
  - [ ] 12.1 Implement initLinks and openLink in js/app.js
    - Load saved links from `loadJSON('tld.links', [])` on startup and render buttons
    - Bind add control: `validateLink` then `createLink`, render updated set, persist via `saveJSON`
    - Bind remove control: `deleteLink`, render, persist
    - Bind open control: `openLink(url)` calls `window.open(url, '_blank')`; if blocked (returns `null`), fall back to `window.location.href = url`
    - On `saveJSON` failure: retain in-memory set and display non-blocking error indication
    - Null-check root element
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_



- [ ] 13. Bootstrap and final wiring
  - [ ] 13.1 Implement guarded init() and wire all widgets together in js/app.js
    - `init()` runs on `DOMContentLoaded`, guarded by `typeof document !== 'undefined'` at module top level
    - Call `startGreeting`, `initTimer`, `initTodo`, and `initLinks` with their respective DOM root elements
    - Wire `initTodo` and `initLinks` with the Storage Adapter instance
    - _Requirements: 1.1-1.7, 2.1-2.8, 3.1-3.10, 4.1-4.8_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP.
- Each task references specific requirements for traceability to the requirements document.
- Property tests use fast-check with a minimum of 100 randomized iterations per property.
- Each property test must include a comment tag referencing its design property: `Feature: todo-life-dashboard, Property N: <text>`.
- Generators must cover documented edge cases: whitespace-only strings, length boundaries (200 for tasks, 100 for link names), hour boundaries (4/5, 11/12, 16/17), zero/negative remaining time, and empty/`null`/malformed stored JSON.
- Pure logic functions are implemented first and property-tested before the DOM/controller layer is built.
- All JavaScript lives in one file (`js/app.js`) as an ES module; the guarded `init()` ensures importing pure functions under Node for tests never triggers DOM side effects.
- Checkpoints ensure incremental validation at logical breaks in the implementation.
- Run tests with `npx vitest run` (single execution, not watch mode).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1", "2.2"] },
    { "id": 3, "tasks": ["4.1", "3.2"] },
    { "id": 4, "tasks": ["5.1", "3.3", "4.2"] },
    { "id": 5, "tasks": ["6.1", "3.4", "4.3", "5.2"] },
    { "id": 6, "tasks": ["8.1", "8.2", "4.4", "5.3", "6.2"] },
    { "id": 7, "tasks": ["9.1", "4.5", "5.4", "6.3"] },
    { "id": 8, "tasks": ["10.1", "4.6", "5.5", "6.4"] },
    { "id": 9, "tasks": ["11.1", "5.6", "6.5"] },
    { "id": 10, "tasks": ["12.1"] },
    { "id": 11, "tasks": ["13.1", "9.2"] },
    { "id": 12, "tasks": ["10.2", "11.2", "12.2"] },
    { "id": 13, "tasks": ["11.3", "12.3"] },
    { "id": 14, "tasks": ["11.4", "12.4"] }
  ]
}
```
