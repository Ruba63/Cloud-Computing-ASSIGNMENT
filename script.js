// =========================
// TaskFlow JS Controller (Fixed)
// =========================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editId = null;

// عناصر الصفحة
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
// مودال
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
// حفظ
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
// عرض الكروت
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
    card.setAttribute("data-priority", task.priority);

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${task.title}</div>

        <div class="card-actions">
          <button class="icon-btn" onclick="editTask(${task.id})">✎</button>
          <button class="icon-btn delete" onclick="deleteTask(${task.id})">🗑</button>
        </div>
      </div>

      <div class="card-description">
        ${task.desc || ""}
      </div>

      <div class="card-meta">
        <span class="badge badge-${task.status.toLowerCase().replace(" ", "-")}">
          <span class="badge-dot"></span>
          ${task.status}
        </span>

        <span class="badge badge-${task.priority.toLowerCase()}">
          <span class="badge-dot"></span>
          ${task.priority}
        </span>
      </div>

      <div class="card-footer">
        <div class="assigned-chip">
          <div class="assigned-avatar">
            ${(task.assigned || "").slice(0,2).toUpperCase()}
          </div>
          <span class="assigned-name">${task.assigned}</span>
        </div>

        <div class="due-chip ${isOverdue(task.due) ? "overdue" : ""}">
          📅 ${task.due || "-"}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  updateStats();
  save();
}

// =========================
// أدوات مساعدة
// =========================
function isOverdue(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

// =========================
// تعديل وحذف
// =========================
window.editTask = (id) => {
  const task = tasks.find(t => t.id === id);
  openModal(true, task);
};

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
// فلترة وبحث
// =========================
searchInput.addEventListener("input", render);
priorityFilter.addEventListener("change", render);
sortSelect.addEventListener("change", render);

// =========================
// أزرار المودال
// =========================
openBtn.onclick = () => openModal();
closeBtn.onclick = closeModal;
cancelBtn.onclick = closeModal;

// =========================
// إحصائيات
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
// تشغيل أولي
// =========================
render();