'use strict';

const LS_KEY = 'taskflow_tasks_v1';
const LS_THEME = 'taskflow_theme';

const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

const state = {
  tasks: [],
  statusFilter: '',
  priorityFilter: '',
  searchQuery: '',
  sortMode: 'newest',
  editingId: null,
  deleteTargetId: null,
};

/* =========================
   STORAGE
========================= */

function loadTasks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(LS_KEY, JSON.stringify(state.tasks));
}

/* =========================
   TASKS
========================= */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createTask(data) {
  const task = {
    id: generateId(),
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    assigned_to: (data.assigned_to || '').trim(),
    status: data.status || 'Pending',
    priority: data.priority || 'Medium',
    due_date: data.due_date || '',
    created_at: new Date().toISOString(),
  };

  state.tasks.unshift(task);
  saveTasks();
  return task;
}

function updateTask(id, data) {
  const idx = state.tasks.findIndex(t => t.id === id);
  if (idx === -1) return;

  state.tasks[idx] = {
    ...state.tasks[idx],
    title: data.title !== undefined ? data.title : state.tasks[idx].title,
    description: data.description !== undefined ? data.description : state.tasks[idx].description,
    assigned_to: data.assigned_to || state.tasks[idx].assigned_to,
    status: data.status || state.tasks[idx].status,
    priority: data.priority || state.tasks[idx].priority,
    due_date: data.due_date !== undefined ? data.due_date : state.tasks[idx].due_date,
  };

  saveTasks();
}

/* =========================
   FILTER
========================= */

function getFilteredTasks() {
  let tasks = [...state.tasks];

  if (state.statusFilter) {
    tasks = tasks.filter(t => t.status === state.statusFilter);
  }

  if (state.priorityFilter) {
    tasks = tasks.filter(t => t.priority === state.priorityFilter);
  }

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    tasks = tasks.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.assigned_to || '').toLowerCase().includes(q)
    );
  }

  switch (state.sortMode) {
    case 'oldest':
      tasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;

    case 'due':
      tasks.sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0));
      break;

    case 'priority':
      tasks.sort((a, b) =>
        (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0)
      );
      break;

    default:
      tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return tasks;
}

/* =========================
   RENDER SIMPLE FIX CORE
========================= */

function renderTasks() {
  const grid = document.getElementById('tasks-grid');
  const empty = document.getElementById('empty-state');

  const tasks = getFilteredTasks();

  if (tasks.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';

  grid.innerHTML = tasks.map(t => `
    <div class="task-card">
      <h3>${t.title}</h3>
      <p>${t.description}</p>
      <p>${t.assigned_to}</p>
      <p>${t.status}</p>

      <button class="edit-btn" data-id="${t.id}">Edit</button>
      <button class="delete-btn" data-id="${t.id}">Delete</button>
    </div>
  `).join('');

  grid.querySelectorAll('.edit-btn').forEach(b => {
    b.onclick = () => openEditModal(b.dataset.id);
  });

  grid.querySelectorAll('.delete-btn').forEach(b => {
    b.onclick = () => deleteTask(b.dataset.id);
  });
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/* =========================
   MODAL
========================= */

function openEditModal(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  state.editingId = id;

  document.getElementById('task-title').value = task.title;
  document.getElementById('task-desc').value = task.description;
  document.getElementById('task-assigned').value = task.assigned_to;

  document.getElementById('modal-overlay').classList.add('open');
}

function handleSubmit(e) {
  e.preventDefault();

  const data = {
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-desc').value,
    assigned_to: document.getElementById('task-assigned').value,
    status: document.getElementById('task-status').value,
    priority: document.getElementById('task-priority').value,
    due_date: document.getElementById('task-due').value,
  };

  if (state.editingId) {
    updateTask(state.editingId, data);
  } else {
    createTask(data);
  }

  state.editingId = null;
  document.getElementById('modal-overlay').classList.remove('open');
  renderTasks();
}

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', () => {
  state.tasks = loadTasks();

  document.getElementById('task-form').addEventListener('submit', handleSubmit);

  document.getElementById('open-modal-btn').onclick = () => {
    state.editingId = null;
    document.getElementById('task-form').reset();
    document.getElementById('modal-overlay').classList.add('open');
  };

  renderTasks();
});