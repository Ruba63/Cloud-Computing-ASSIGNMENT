let tasks = [];

function addTask() {
  const title = document.getElementById("title").value;
  const user = document.getElementById("user").value;
  const status = document.getElementById("status").value;

  tasks.push({ title, user, status });
  renderTasks(tasks);
}

function renderTasks(list) {
  const container = document.getElementById("tasks");
  container.innerHTML = "";

  list.forEach(t => {
    container.innerHTML += `
      <div class="task">
        <b>${t.title}</b><br>
        ${t.user} - ${t.status}
      </div>
    `;
  });
}

function filterTasks(type) {
  if (type === "all") {
    renderTasks(tasks);
  } else {
    renderTasks(tasks.filter(t => t.status === type));
  }
}