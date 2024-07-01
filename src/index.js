document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById("task1");
    const priorityInput = document.getElementById("priority");
    const deadlineInput = document.getElementById("deadline");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const searchInput = document.getElementById("search");
    let formPopup = document.getElementById("myForm");
    const editTaskInput = document.getElementById("edit-task");
    const editPriorityInput = document.getElementById("edit-priority");
    const editDeadlineInput = document.getElementById("edit-deadline");
    const editStatusInput = document.getElementById("edit-Status");
    const saveTaskButton = document.getElementById("save-task");

    formPopup.style.display = "none";
    document.getElementById('editForm').style.display = 'none'
    let editIndex = -1;

    addTaskButton.addEventListener("click", () => {
        const task = taskInput.value;
        const priority = priorityInput.value;
        const deadline = deadlineInput.value;

        if (task.trim() === "" || deadline === "") {
            alert("Please add task details.");
            return;
        }

        const selectedDate = new Date(deadline);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
            alert("Please select an upcoming date for the deadline.");
            return;
        }

        if (editIndex > -1) {
            const status = editStatusInput.value;
            updateTaskInLocalStorage(editIndex, task, priority, deadline, status);
            editIndex = -1;
        } else {
            const taskItem = createTaskElement(task, priority, deadline, 'in-process', taskList.children.length);
            taskList.appendChild(taskItem);
            storeTaskInLocalStorage(task, priority, deadline, 'in-process');
        }

        taskInput.value = "";
        priorityInput.value = "top";
        deadlineInput.value = "";
        displayStoredData();
        clearInputs();
        closeTaskForm();
    });

    searchInput.addEventListener("input", searchList);

    function searchList() {
        let input = searchInput.value.toLowerCase();
        let tasks = document.querySelectorAll('.task');
        tasks.forEach((task) => {
            let taskNameElement = task.querySelector('.task-name');
            if (taskNameElement) {
                let taskName = taskNameElement.textContent.toLowerCase();
                if (taskName.includes(input)) {
                    task.style.display = "";
                } else {
                    task.style.display = "none";
                }
            }
        });
    }

    function createTaskElement(task, priority, deadline, status, index) {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task");
        taskItem.innerHTML = `
            <p class="task-name">${task}</p>
            <p>Priority: ${priority}</p>
            <p>Deadline: ${deadline}</p>
            <select class="status" id="status">
                <option value="in-process" ${status === 'in-process' ? 'selected' : ''}>In-process</option>
                <option value="hold" ${status === 'hold' ? 'selected' : ''}>Hold</option>
                <option value="complete" ${status === 'complete' ? 'selected' : ''}>Complete</option>
            </select>
            <button class="edit-task">Edit</button>
            <button class="delete-task">Delete</button>`;

        const statusDropdown = taskItem.querySelector('.status');
        statusDropdown.addEventListener('change', function() {
            taskItem.className = 'task';
            taskItem.classList.add(statusDropdown.value);
            updateTaskInLocalStorage(index, task, priority, deadline, statusDropdown.value);
        });

        const editButton = taskItem.querySelector('.edit-task');
        editButton.addEventListener('click', function() {
            openEditForm(index, task, priority, deadline, statusDropdown.value);
        });

        const deleteButton = taskItem.querySelector('.delete-task');
        deleteButton.addEventListener('click', function() {
            deleteTask(taskItem, index);
        });

        return taskItem;
    }

    function storeTaskInLocalStorage(task, priority, deadline, status) {
        const taskData = {
            task: task,
            priority: priority,
            deadline: deadline,
            status: status
        };
        let tasks = localStorage.getItem('tasks');
        if (tasks) {
            tasks = JSON.parse(tasks);
        } else {
            tasks = [];
        }
        tasks.push(taskData);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTaskInLocalStorage(index, task, priority, deadline, status) {
        let tasks = localStorage.getItem('tasks');
        if (tasks) {
            tasks = JSON.parse(tasks);
            if (tasks[index]) {
                tasks[index].task = task;
                tasks[index].priority = priority;
                tasks[index].deadline = deadline;
                tasks[index].status = status;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                displayStoredData();
            }
        }
    }

    function deleteTask(taskItem, index) {
        taskItem.remove();
        let tasks = localStorage.getItem('tasks');
        if (tasks) {
            tasks = JSON.parse(tasks);
            tasks.splice(index, 1);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            displayStoredData();
        }
    }

    function displayStoredData() {
        taskList.innerHTML = '';
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            const tasks = JSON.parse(storedTasks);
            tasks.forEach((task, index) => {
                const taskItem = createTaskElement(task.task, task.priority, task.deadline, task.status, index);
                taskList.appendChild(taskItem);
            });
        } else {
            taskList.innerHTML = '<p>No tasks stored.</p>';
        }
    }

    function openEditForm(index, task, priority, deadline, status) {
        editTaskInput.value = task;
        editPriorityInput.value = priority;
        editDeadlineInput.value = deadline;
        editStatusInput.value = status;
        editIndex = index;
        document.getElementById('editForm').style.display = 'flex';
    }

    saveTaskButton.addEventListener('click', () => {
        const task = editTaskInput.value;
        const priority = editPriorityInput.value;
        const deadline = editDeadlineInput.value;
        const status = editStatusInput.value;

        if (task.trim() === "" || deadline === "") {
            alert("Please add task details.");
            return;
        }

        const selectedDate = new Date(deadline);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
            alert("Please select an upcoming date for the deadline.");
            return;
        }

        updateTaskInLocalStorage(editIndex, task, priority, deadline, status);
        editIndex = -1;
        document.getElementById('editForm').style.display = 'none';
        displayStoredData();
        closeTaskForms();
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" || event.key === "Esc") {
            closeTaskForm();
        }
    });

    displayStoredData();
});

function openTaskForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeTaskForm() {
    document.getElementById("myForm").style.display = "none";
}

function closeTaskForms() {
    document.getElementById("editForm").style.display = "none";
}

function clearInputs() {
    document.getElementById("task1").value = "";
    document.getElementById("priority").value = "top";
    document.getElementById("deadline").value = "";
}
