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
    // let isFormOpen = document.getElementById("myForm");
    formPopup.style.display = "none";
    document.getElementById('editForm').style.display = 'none'
    let editIndex = -1; // New variable to keep track of the task being edited

    addTaskButton.addEventListener("click", () => {
        formPopup.style.display = "block";
        const task = taskInput.value;
        const priority = priorityInput.value;
        const deadline = deadlineInput.value;

        if (task.trim() === "" || deadline === "") {
            alert("Please add task details.");
            return; // Don't add task if task or deadline is empty
        }

        const selectedDate = new Date(deadline);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
            alert("Please select an upcoming date for the deadline.");
            return; // Don't add task if deadline is not in the future
        }

        if (editIndex > -1) {
            // Update existing task
            const status = editStatusInput.value;
            updateTaskInLocalStorage(editIndex, task, priority, deadline, status);
            editIndex = -1; // Reset editIndex
        } else {
            // Add new task
            const taskItem = createTaskElement(task, priority, deadline, 'in-process', taskList.children.length);
            taskList.appendChild(taskItem);
            // Store the task in local storage
            storeTaskInLocalStorage(task, priority, deadline, 'in-process');
        }

        taskInput.value = "";
        priorityInput.value = "top";
        deadlineInput.value = "";
        displayStoredData(); // Refresh the task list

        clearInputs();
         closeTaskForm()
      
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
            <p class="task-name">Task: ${task}</p>
            <p>Priority: ${priority}</p>
            <p>Deadline: ${deadline}</p>
            <select class="status">
              <option value="in-process" ${status === 'in-process' ? 'selected' : ''}>In-process</option>
              <option value="hold" ${status === 'hold' ? 'selected' : ''}>Hold</option>
              <option value="complete" ${status === 'complete' ? 'selected' : ''}>Complete</option>
            </select>
            <button class="edit-task">Edit</button>
            <button class="delete-task">Delete</button>`;

        const statusDropdown = taskItem.querySelector('.status');
        statusDropdown.addEventListener('change', function() {
            taskItem.className = 'task'; // Reset class
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
        // Retrieve existing tasks from local storage
        let tasks = localStorage.getItem('tasks');
        if (tasks) {
            tasks = JSON.parse(tasks);
        } else {
            tasks = [];
        }
        // Add the new task to the tasks array
        tasks.push(taskData);
        // Store the updated tasks array in local storage
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
                displayStoredData(); // Refresh the task list
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
            displayStoredData(); // Refresh the task list
        }
    }

    function displayStoredData() {
        taskList.innerHTML = ''; // Clear the existing list
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
        formPopup.style.display = "block";
        isFormOpen = true;
    }

    saveTaskButton.addEventListener('click', () => {
        const task = editTaskInput.value;
        const priority = editPriorityInput.value;
        const deadline = editDeadlineInput.value;
        const status = editStatusInput.value;

        if (task.trim() === "" || deadline === "") {
            alert("Please add task details.");
            return; // Don't save task if task or deadline is empty
        }

        const selectedDate = new Date(deadline);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
            alert("Please select an upcoming date for the deadline.");
            return; // Don't save task if deadline is not in the future
        }

        updateTaskInLocalStorage(editIndex, task, priority, deadline, status);
        editIndex = -1; // Reset editIndex
        formPopup.style.display = "none";
        displayStoredData(); // Refresh the task list
        isFormOpen = false;
        closeTaskForms();
    });

    // closeFormButton.addEventListener('click', closeTaskForm);

    // Close the form popup when the ESC key is pressed
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" || event.key === "Esc") {
            closeTaskForm();
        }
    });

    // Display stored data on page load
    displayStoredData();
});

function openTaskForm() {
    document.getElementById("myForm").style.display = "block";
    isFormOpen = true;
}

function closeTaskForm() {
    document.getElementById("myForm").style.display = "none";
    isFormOpen = false;
}

function closeTaskForms() {
    document.getElementById("editForm").style.display = "none";
    isFormOpen = false;
}
function clearInputs() {
    // Clear input fields
    document.getElementById("task1").value = "";
    document.getElementById("priority").value = "";
    document.getElementById("deadline").value = "";
}