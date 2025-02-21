document.addEventListener("DOMContentLoaded", function () {
    fetchTasks();
});

let lastAction = null;  // Store the last action for undo

// Fetch and render tasks from Flask
function fetchTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(data => {
            tasks = data;  // Update tasks list
            renderTasks();
        });
}

// Add a new task
function addTask() {
    const input = document.getElementById("task-input");
    if (input.value.trim() === "") return;

    let task = { text: input.value };

    fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    }).then(response => response.json())
    .then(data => {
        tasks.push(data.task);
        lastAction = { type: "add", task: data.task };
        showUndoMessage("Task added!");
        renderTasks();
    });

    input.value = "";
}

// Remove task
function removeTask(taskId) {
    let removedTask = tasks.find(task => task.id === taskId);
    
    fetch(`/tasks/${taskId}`, { method: 'DELETE' })
    .then(() => {
        tasks = tasks.filter(task => task.id !== taskId);
        lastAction = { type: "remove", task: removedTask };
        showUndoMessage("Task removed!");
        renderTasks();
    });
}

// Complete task
function completeTask(taskId) {
    let task = tasks.find(task => task.id === taskId);
    
    fetch(`/tasks/${taskId}`, { method: 'PUT' })
    .then(response => response.json())
    .then(data => {
        tasks = tasks.map(t => t.id === taskId ? data.task : t);
        lastAction = { type: "complete", task: data.task };
        showUndoMessage("Task marked complete!");
        renderTasks();
    });
}

// Render tasks
function renderTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const taskElement = document.createElement("li");
        taskElement.className = `task ${task.completed ? "completed" : ""}`;
        taskElement.innerHTML = `
            <span>${task.text}</span>
            <div class="buttons">
                <button onclick="completeTask(${task.id})">Complete</button>
                <button onclick="removeTask(${task.id})">Remove</button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

// Undo last action
function undoLastAction() {
    if (!lastAction) return;

    if (lastAction.type === "add") {
        removeTask(lastAction.task.id);
    } else if (lastAction.type === "remove") {
        addTaskBack(lastAction.task);
    } else if (lastAction.type === "complete") {
        completeTask(lastAction.task.id);
    }

    lastAction = null;
}

// Add a task back (for undoing delete)
function addTaskBack(task) {
    fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: task.text })
    }).then(response => response.json())
    .then(data => {
        tasks.push(data.task);
        renderTasks();
    });
}

// Show undo alert for 5 seconds
function showUndoMessage(message) {
    const undoMessage = document.getElementById("undo-message");
    undoMessage.innerText = message + " (Click to undo)";
    undoMessage.classList.add("show");

    undoMessage.onclick = undoLastAction;

    setTimeout(() => {
        undoMessage.classList.remove("show");
        undoMessage.onclick = null; // Remove click event after timeout
    }, 7000);
}

// Dark Mode Toggle
document.getElementById("theme-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});
