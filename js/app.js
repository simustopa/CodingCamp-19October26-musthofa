// To-Do List Life Dashboard
// Vanilla JavaScript ES module.
//
// Layers:
// 1. Pure Logic
// 2. Storage Adapter
// 3. Controller / DOM
// 4. Bootstrap

// ============================================================
// 1. SHARED UTILITIES
// ============================================================

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10);
}

// ============================================================
// 2. GREETING WIDGET - PURE LOGIC
// ============================================================

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) {
    return 'Good morning.';
  }

  if (hour >= 12 && hour <= 16) {
    return 'Good afternoon.';
  }

  return 'Good evening.';
}

// ============================================================
// 3. FOCUS TIMER - PURE LOGIC
// ============================================================

const TIMER_DURATION = 25 * 60 * 1000;

function createTimerState() {
  return {
    remainingMs: TIMER_DURATION,
    status: 'idle'
  };
}

function formatTimer(remainingMs) {
  const totalSeconds = Math.ceil(
    Math.max(0, remainingMs) / 1000
  );

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0')
  );
}

function tick(state) {
  if (state.status !== 'running') {
    return state;
  }

  const remainingMs = Math.max(
    0,
    state.remainingMs - 1000
  );

  return {
    remainingMs,
    status: remainingMs === 0 ? 'finished' : 'running'
  };
}

function start(state) {
  if (
    state.status === 'running' ||
    state.status === 'finished'
  ) {
    return state;
  }

  return {
    ...state,
    status: 'running'
  };
}

function stop(state) {
  if (state.status !== 'running') {
    return state;
  }

  return {
    ...state,
    status: 'paused'
  };
}

function reset() {
  return createTimerState();
}

// ============================================================
// 4. TO-DO LIST - PURE LOGIC
// ============================================================

function validateTaskText(text) {
  return (
    typeof text === 'string' &&
    text.trim().length > 0 &&
    text.length <= 200
  );
}

function createTask(text) {
  if (!validateTaskText(text)) {
    throw new TypeError(
      'Task must contain 1–200 characters.'
    );
  }

  return {
    id: makeId(),
    text: text.trim(),
    done: false
  };
}

function toggleTask(task) {
  return {
    ...task,
    done: !task.done
  };
}

function editTask(task, newText) {
  if (!validateTaskText(newText)) {
    return {
      ok: false,
      reason: 'Task must contain 1–200 characters.'
    };
  }

  return {
    ok: true,
    task: {
      ...task,
      text: newText.trim()
    }
  };
}

function deleteTask(list, id) {
  return list.filter(task => task.id !== id);
}

function serializeTasks(list) {
  return JSON.stringify(list);
}

function deserializeTasks(json) {
  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(task =>
      task &&
      typeof task.id === 'string' &&
      typeof task.text === 'string' &&
      task.text.trim().length > 0 &&
      task.text.length <= 200 &&
      typeof task.done === 'boolean'
    );
  } catch {
    return [];
  }
}

// ============================================================
// 5. QUICK LINKS - PURE LOGIC
// ============================================================

function validateLink(name, url) {
  if (
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    name.length > 100
  ) {
    return false;
  }

  if (typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);

    return (
      ['http:', 'https:'].includes(parsed.protocol) &&
      /^https?:\/\//i.test(url)
    );
  } catch {
    return false;
  }
}

function createLink(name, url) {
  if (!validateLink(name, url)) {
    throw new TypeError('Invalid link name or URL.');
  }

  return {
    id: makeId(),
    name: name.trim(),
    url: url.trim()
  };
}

function deleteLink(list, id) {
  return list.filter(link => link.id !== id);
}

function serializeLinks(list) {
  return JSON.stringify(list);
}

function deserializeLinks(json) {
  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(link =>
      link &&
      typeof link.id === 'string' &&
      typeof link.name === 'string' &&
      link.name.trim().length > 0 &&
      link.name.length <= 100 &&
      typeof link.url === 'string' &&
      validateLink(link.name, link.url)
    );
  } catch {
    return [];
  }
}

// ============================================================
// 6. STORAGE ADAPTER
// ============================================================

function isStorageAvailable() {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    const key = '__tld_storage_test__';

    localStorage.setItem(key, '1');
    localStorage.getItem(key);
    localStorage.removeItem(key);

    return true;
  } catch {
    return false;
  }
}

function loadJSON(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') {
      return fallback;
    }

    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    if (typeof localStorage === 'undefined') {
      return {
        ok: false,
        error: new Error('Local Storage is unavailable.')
      };
    }

    localStorage.setItem(key, JSON.stringify(value));

    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

// ============================================================
// 7. DOM HELPERS
// ============================================================

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = byId(id);

  if (element) {
    element.textContent = value;
  }
}

function showMessage(id, message, isError = false) {
  const element = byId(id);

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.toggle('is-error', isError);
  element.classList.toggle('is-success', !isError && Boolean(message));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

// ============================================================
// 8. GREETING WIDGET - CONTROLLER
// ============================================================

function startGreeting(root) {
  if (!root) {
    return;
  }

  function render() {
    const now = new Date();

    setText('current-time', formatTime(now));
    setText('current-date', formatDate(now));
    setText('greeting-text', getGreeting(now.getHours()));
  }

  render();

  // Align updates to the next second.
  const delay = 1000 - (Date.now() % 1000);

  setTimeout(() => {
    render();

    setInterval(render, 1000);
  }, delay);
}

// ============================================================
// 9. FOCUS TIMER - CONTROLLER
// ============================================================

function initTimer(root) {
  if (!root) {
    return;
  }

  let state = createTimerState();
  let intervalId = null;

  const startButton = byId('timer-start');
  const stopButton = byId('timer-stop');
  const resetButton = byId('timer-reset');

  const circumference = 2 * Math.PI * 88;

  function render() {
    setText('timer-display', formatTimer(state.remainingMs));

    const statusText = {
      idle: 'READY TO FOCUS',
      running: 'FOCUS IN PROGRESS',
      paused: 'SESSION PAUSED',
      finished: 'SESSION COMPLETE'
    };

    setText('timer-status', statusText[state.status]);

    const progress = byId('timer-progress');

    if (progress) {
      const fraction = Math.max(
        0,
        Math.min(1, state.remainingMs / TIMER_DURATION)
      );

      progress.style.strokeDasharray = String(circumference);
      progress.style.strokeDashoffset = String(
        circumference * (1 - fraction)
      );
    }

    if (startButton) {
      startButton.disabled = state.status === 'running' ||
        state.status === 'finished';

      startButton.textContent =
        state.status === 'paused' ? 'Resume focus' : 'Start focus';
    }

    if (stopButton) {
      stopButton.disabled = state.status !== 'running';
    }

    const message = {
      idle: 'Find your focus. Forget the noise.',
      running: 'Stay present. You are doing great.',
      paused: 'Take your time. Resume when you are ready.',
      finished: 'Well done! You completed your focus session.'
    };

    setText('timer-message', message[state.status]);
  }

  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function runTimer() {
    clearTimer();

    let previousTime = Date.now();

    intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - previousTime;

      previousTime = now;

      if (state.status !== 'running') {
        clearTimer();
        return;
      }

      state = {
        ...state,
        remainingMs: Math.max(0, state.remainingMs - elapsed)
      };

      if (state.remainingMs === 0) {
        state = {
          remainingMs: 0,
          status: 'finished'
        };

        clearTimer();
      }

      render();
    }, 250);
  }

  if (startButton) {
    startButton.addEventListener('click', () => {
      state = start(state);

      if (state.status === 'running') {
        runTimer();
      }

      render();
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', () => {
      state = stop(state);
      clearTimer();
      render();
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      clearTimer();
      state = reset();
      render();
    });
  }

  render();
}

// ============================================================
// 10. TO-DO LIST - CONTROLLER
// ============================================================

function initTodo(root, storage) {
  if (!root) {
    return;
  }

  let tasks = deserializeTasks(
    JSON.stringify(storage.loadJSON('tld.tasks', []))
  );

  let currentFilter = 'all';

  const form = byId('todo-form');
  const input = byId('todo-input');
  const list = byId('task-list');

  function persist() {
    const result = storage.saveJSON('tld.tasks', tasks);

    if (!result.ok) {
      showMessage(
        'todo-message',
        'Changes are visible, but could not be saved. Check browser storage.',
        true
      );

      return false;
    }

    return true;
  }

  function updateSummary() {
    const completed = tasks.filter(task => task.done).length;
    const remaining = tasks.length - completed;

    setText('total-tasks', String(tasks.length));
    setText('completed-tasks', String(completed));
    setText('remaining-tasks', String(remaining));
    setText('task-count', `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`);

    setText(
      'task-progress-text',
      `${completed} of ${tasks.length} completed`
    );

    const percentage = tasks.length === 0
      ? 0
      : Math.round((completed / tasks.length) * 100);

    const progress = byId('task-progress');

    if (progress) {
      progress.setAttribute('aria-valuenow', String(percentage));
    }

    const bar = byId('task-progress-bar');

    if (bar) {
      bar.style.width = `${percentage}%`;
    }
  }

  function render() {
    if (!list) {
      return;
    }

    list.replaceChildren();

    const visibleTasks = tasks.filter(task => {
      if (currentFilter === 'active') {
        return !task.done;
      }

      if (currentFilter === 'completed') {
        return task.done;
      }

      return true;
    });

    if (visibleTasks.length === 0) {
      const empty = createElement('li', 'empty-state');

      const icon = createElement('span', 'empty-icon', '✳');

      const title = createElement(
        'strong',
        '',
        currentFilter === 'completed'
          ? 'Nothing completed yet.'
          : currentFilter === 'active'
            ? 'All caught up!'
            : 'A clean slate.'
      );

      const description = createElement(
        'span',
        '',
        currentFilter === 'completed'
          ? 'Completed tasks will appear here.'
          : currentFilter === 'active'
            ? 'You have no active tasks.'
            : 'Add your first task to get started.'
      );

      empty.append(icon, title, description);
      list.append(empty);

      updateSummary();
      return;
    }

    visibleTasks.forEach(task => {
      const item = createElement(
        'li',
        `task-item${task.done ? ' is-completed' : ''}`
      );

      const checkbox = createElement('button', 'task-checkbox');

      checkbox.type = 'button';
      checkbox.setAttribute(
        'aria-label',
        task.done ? 'Mark task as active' : 'Mark task as completed'
      );
      checkbox.setAttribute('aria-pressed', String(task.done));
      checkbox.textContent = task.done ? '✓' : '';

      checkbox.addEventListener('click', () => {
        tasks = tasks.map(existing =>
          existing.id === task.id
            ? toggleTask(existing)
            : existing
        );

        persist();
        render();
      });

      const text = createElement('span', 'task-text', task.text);

      const actions = createElement('div', 'task-actions');

      const editButton = createElement('button', 'task-action', 'Edit');

      editButton.type = 'button';
      editButton.setAttribute('aria-label', `Edit task: ${task.text}`);

      editButton.addEventListener('click', () => {
        const newText = window.prompt('Edit your task:', task.text);

        if (newText === null) {
          return;
        }

        const result = editTask(task, newText);

        if (!result.ok) {
          showMessage('todo-message', result.reason, true);
          return;
        }

        tasks = tasks.map(existing =>
          existing.id === task.id ? result.task : existing
        );

        persist();
        showMessage('todo-message', 'Task updated successfully.');
        render();
      });

      const deleteButton = createElement('button', 'task-action delete-action', 'Delete');

      deleteButton.type = 'button';
      deleteButton.setAttribute('aria-label', `Delete task: ${task.text}`);

      deleteButton.addEventListener('click', () => {
        tasks = deleteTask(tasks, task.id);

        persist();
        showMessage('todo-message', 'Task deleted.');
        render();
      });

      actions.append(editButton, deleteButton);

      item.append(checkbox, text, actions);
      list.append(item);
    });

    updateSummary();
  }

  if (form && input) {
    form.addEventListener('submit', event => {
      event.preventDefault();

      if (!validateTaskText(input.value)) {
        showMessage(
          'todo-message',
          'Enter a task containing 1–200 characters.',
          true
        );

        input.focus();
        return;
      }

      tasks.push(createTask(input.value));

      const saved = persist();

      input.value = '';
      showMessage(
        'todo-message',
        saved ? 'Task added successfully.' : 'Task added temporarily; saving failed.',
        !saved
      );

      render();
      input.focus();
    });
  }

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;

      document.querySelectorAll('[data-filter]').forEach(filterButton => {
        const active = filterButton === button;

        filterButton.classList.toggle('active', active);
        filterButton.setAttribute('aria-pressed', String(active));
      });

      render();
    });
  });

  render();
}

// ============================================================
// 11. QUICK LINKS - CONTROLLER
// ============================================================

function initLinks(root, storage) {
  if (!root) {
    return;
  }

  let links = deserializeLinks(
    JSON.stringify(storage.loadJSON('tld.links', []))
  );

  const form = byId('links-form');
  const nameInput = byId('link-name');
  const urlInput = byId('link-url');
  const container = byId('links-list');

  function persist() {
    const result = storage.saveJSON('tld.links', links);

    if (!result.ok) {
      showMessage(
        'links-message',
        'Changes could not be saved. Check browser storage.',
        true
      );

      return false;
    }

    return true;
  }

  function render() {
    if (!container) {
      return;
    }

    container.replaceChildren();

    setText(
      'links-count',
      `${links.length} ${links.length === 1 ? 'link' : 'links'}`
    );

    if (links.length === 0) {
      container.append(
        createElement(
          'div',
          'links-empty',
          'Your shortcuts will appear here.'
        )
      );

      return;
    }

    links.forEach(link => {
      const card = createElement('article', 'quick-link-card');

      const openButton = createElement('button', 'quick-link-open');

      openButton.type = 'button';

      const icon = createElement('span', 'quick-link-icon', '↗');
      const name = createElement('span', 'quick-link-name', link.name);

      openButton.append(icon, name);

      openButton.addEventListener('click', () => {
        const opened = window.open(
          link.url,
          '_blank',
          'noopener,noreferrer'
        );

        if (!opened) {
          // Avoid silently navigating away from the dashboard.
          showMessage(
            'links-message',
            'Your browser blocked the new tab. Allow pop-ups to open this link.',
            true
          );
        }
      });

      const removeButton = createElement(
        'button',
        'quick-link-remove',
        '×'
      );

      removeButton.type = 'button';
      removeButton.setAttribute('aria-label', `Remove ${link.name}`);

      removeButton.addEventListener('click', () => {
        links = deleteLink(links, link.id);

        persist();
        showMessage('links-message', 'Link removed.');
        render();
      });

      card.append(openButton, removeButton);
      container.append(card);
    });
  }

  if (form && nameInput && urlInput) {
    form.addEventListener('submit', event => {
      event.preventDefault();

      const name = nameInput.value.trim();
      const url = urlInput.value.trim();

      if (!validateLink(name, url)) {
        showMessage(
          'links-message',
          'Enter a name and a valid HTTP or HTTPS URL.',
          true
        );

        return;
      }

      links.push(createLink(name, url));

      const saved = persist();

      nameInput.value = '';
      urlInput.value = '';

      showMessage(
        'links-message',
        saved ? 'Quick link added.' : 'Link added temporarily; saving failed.',
        !saved
      );

      render();
      nameInput.focus();
    });
  }

  render();
}

// ============================================================
// 12. BOOTSTRAP
// ============================================================

const storage = {
  isAvailable: isStorageAvailable,
  loadJSON,
  saveJSON
};

function init() {
  const greetingRoot = byId('greeting');
  const timerRoot = byId('focus');
  const todoRoot = byId('todo');
  const linksRoot = byId('links');

  startGreeting(greetingRoot);
  initTimer(timerRoot);
  initTodo(todoRoot, storage);
  initLinks(linksRoot, storage);

  if (!storage.isAvailable()) {
    showMessage(
      'todo-message',
      'Browser storage is unavailable. Your changes may not persist after reload.',
      true
    );
  }
}

// ============================================================
// 13. EXPORTS FOR TESTING
// ============================================================

export {
  makeId,

  formatTime,
  formatDate,
  getGreeting,

  TIMER_DURATION,
  createTimerState,
  formatTimer,
  tick,
  start,
  stop,
  reset,

  validateTaskText,
  createTask,
  toggleTask,
  editTask,
  deleteTask,
  serializeTasks,
  deserializeTasks,

  validateLink,
  createLink,
  deleteLink,
  serializeLinks,
  deserializeLinks,

  isStorageAvailable,
  loadJSON,
  saveJSON,

  startGreeting,
  initTimer,
  initTodo,
  initLinks,
  init
};

// Only initialize the interface in a browser.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
