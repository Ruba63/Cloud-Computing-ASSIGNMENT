// =========================
// TaskFlow JS Controller
// =========================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editId = null;

// عناصر
const grid = document.getElementById("tasks-grid");
const modal = document.getElementById("modal-overlay");
const form = document.getElementById("task-form");

const openBtn = document.getElementById("open-modal-btn");
const closeBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");

const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const sortSelect = document.getElementById("sort-select");

const emptyState = document.getElementById("empty-state");

// =========================
// فتح وإغلاق المودال
// =========================
function openModal(edit = false, task = null) {
  modal.classList.add("open");

  if (edit && task) {
    editId = task.id;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.desc;
    document.getElementById("task-assigned").value = task.assigned;
    document.getElementById("task-due").value = task.due;
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-status").value = task.status;
    document.getElementById("submit-btn").textContent = "Update Task";
  } else {
    editId = null;
    form.reset();
    document.getElementById("submit-btn").textContent = "Create Task";
  }
}

function closeModal() {
  modal.classList.remove("open");
}

// =========================
// حفظ المهام
// =========================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    id: editId || Date.now(),
    title: document.getElementById("task-title").value,
    desc: document.getElementById("task-desc").value,
    assigned: document.getElementById("task-assigned").value,
    due: document.getElementById("task-due").value,
    priority: document.getElementById("task-priority").value,
    status: document.getElementById("task-status").value
  };

  if (editId) {
    tasks = tasks.map(t => (t.id === editId ? newTask : t));
  } else {
    tasks.push(newTask);
  }

  save();
  render();
  closeModal();
});

// =========================
// عرض المهام
// =========================
function render() {
  const search = searchInput.value.toLowerCase();
  const priority = priorityFilter.value;
  const sort = sortSelect.value;

  let filtered = tasks.filter(t => {
    return (
      (!priority || t.priority === priority) &&
      (!search || t.title.toLowerCase().includes(search))
    );
  });

  if (sort === "newest") filtered.sort((a, b) => b.id - a.id);
  if (sort === "oldest") filtered.sort((a, b) => a.id - b.id);

  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${task.title}</div>
        <div class="card-actions">
          <button class="icon-btn" onclick="editTask(${task.id})">✎</button>
          <button class="icon-btn delete" onclick="deleteTask(${task.id})">🗑</button>
        </div>
      </div>

      <div class="card-description">${task.desc || ""}</div>

      <div class="card-meta">
        <span class="badge badge-${task.status.toLowerCase().replace(" ", "-")}">
          ${task.status}
        </span>
        <span class="badge badge-${task.priority.toLowerCase()}">
          ${task.priority}
        </span>
      </div>

      <div class="card-footer">
        <div class="assigned-chip">${task.assigned}</div>
        <div class="due-chip">${task.due || "-"}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  updateStats();
  save();
}

// =========================
// تعديل
// =========================
window.editTask = (id) => {
  const task = tasks.find(t => t.id === id);
  openModal(true, task);
};

// =========================
// حذف
// =========================
window.deleteTask = (id) => {
  tasks = tasks.filter(t => t.id !== id);
  render();
};

// =========================
// حفظ محلي
// =========================
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =========================
// الفلاتر
// =========================
searchInput.addEventListener("input", render);
priorityFilter.addEventListener("change", render);
sortSelect.addEventListener("change", render);

// sidebar filters
document.querySelectorAll(".nav-link[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    const status = btn.dataset.filter;
    tasks = tasks.filter(t => !status || t.status === status);
    render();
  });
});

document.querySelectorAll(".filter-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const status = tab.dataset.status;
    renderFiltered(status);
  });
});

function renderFiltered(status) {
  const search = searchInput.value.toLowerCase();

  let filtered = tasks.filter(t => {
    return (!status || t.status === status) &&
           (!search || t.title.toLowerCase().includes(search));
  });

  grid.innerHTML = "";

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `<div class="card-title">${task.title}</div>`;
    grid.appendChild(card);
  });
}

// =========================
// الإحصائيات
// =========================
function updateStats() {
  document.getElementById("stat-total").textContent = tasks.length;
  document.getElementById("stat-pending").textContent =
    tasks.filter(t => t.status === "Pending").length;
  document.getElementById("stat-progress").textContent =
    tasks.filter(t => t.status === "In Progress").length;
  document.getElementById("stat-completed").textContent =
    tasks.filter(t => t.status === "Completed").length;
}

// =========================
// مودال controls
// =========================
openBtn.onclick = () => openModal();
closeBtn.onclick = closeModal;
cancelBtn.onclick = closeModal;

// =========================
// تشغيل أولي
// =========================
render();