// =========================
// Simple Task System (UI Only)
// =========================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editId = null;

const grid = document.getElementById("tasks-grid");
const modal = document.getElementById("modal-overlay");

const openBtn = document.getElementById("open-modal-btn");
const closeBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");

const form = document.getElementById("task-form");

// فتح المودال
openBtn.onclick = () => {
  modal.classList.add("open");
  form.reset();
  editId = null;
};

// إغلاق المودال
function closeModal() {
  modal.classList.remove("open");
}

closeBtn.onclick = closeModal;
cancelBtn.onclick = closeModal;

// حفظ مهمة
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const task = {
    id: editId || Date.now(),
    title: document.getElementById("task-title").value,
    desc: document.getElementById("task-desc").value,
    assigned: document.getElementById("task-assigned").value,
    due: document.getElementById("task-due").value,
    priority: document.getElementById("task-priority").value,
    status: document.getElementById("task-status").value
  };

  if (editId) {
    tasks = tasks.map(t => t.id === editId ? task : t);
  } else {
    tasks.push(task);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  render();
  closeModal();
});

// عرض المهام
function render() {
  grid.innerHTML = "";

  if (tasks.length === 0) {
    grid.innerHTML = "<p style='padding:20px'>No tasks yet</p>";
    return;
  }

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";

    card.innerHTML = `
      <div class="card-title">${task.title}</div>
      <div class="card-description">${task.desc || ""}</div>

      <div style="margin-top:10px; font-size:12px;">
        <b>${task.status}</b> • ${task.priority}
      </div>

      <div style="margin-top:10px; display:flex; gap:8px;">
        <button onclick="editTask(${task.id})">Edit</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

// تعديل
window.editTask = (id) => {
  const t = tasks.find(x => x.id === id);

  document.getElementById("task-title").value = t.title;
  document.getElementById("task-desc").value = t.desc;
  document.getElementById("task-assigned").value = t.assigned;
  document.getElementById("task-due").value = t.due;
  document.getElementById("task-priority").value = t.priority;
  document.getElementById("task-status").value = t.status;

  editId = id;
  modal.classList.add("open");
};

// حذف
window.deleteTask = (id) => {
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
};

// أول تشغيل
render();