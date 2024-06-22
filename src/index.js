document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById("task1");
    const priorityInput = document.getElementById("priority");
    const deadlineInput = document.getElementById("deadline");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const searchInput = document.getElementById("search");
    const formPopup = document.getElementById("myForm");

    addTaskButton.addEventListener("click", () => {
        const task = taskInput.value;
        const priority = priorityInput.value;
        const deadline = deadlineInput.value;
        // const status = document.getElementById("status").value;

        if (task.trim() === "" || deadline === "") {
            alert("Please add task detail.");
            return; // Don't add task if task or deadline is empty
        }
        const selectedDate = new Date(deadline);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
            alert("Please select an upcoming date for the deadline.");
            return; // Don't add task if deadline is not in the future
        }

        const taskItem = createTaskElement(task, priority, deadline, status);
        taskList.appendChild(taskItem);

        // Store the task in local storage
        storeTaskInLocalStorage(task, priority, deadline, status);

        taskInput.value = "";
        priorityInput.value = "top";
        deadlineInput.value = "";
        // document.getElementById("status").value = "in-process";

        formPopup.style.display = "none";
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

    function openTask(index) {
        const storedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (storedTasks && storedTasks[index]) {
            const taskData = storedTasks[index];
            document.getElementById("task1").value = taskData.task;
            document.getElementById("priority").value = taskData.priority;
            document.getElementById("deadline").value = formatDate(taskData.deadline);
            document.getElementById("status").value = taskData.status;
            formPopup.style.display = "block";
        }
    }

   
    function createTaskElement(task, priority, deadline, status) {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task");
        // taskItem.classList.add(status);

        taskItem.innerHTML = `
            <p class="task-name">${task}</p>
            <p>Priority: ${priority}</p>
            <p>Deadline: ${deadline}</p>
            <select class="status">
              <option value="in-process" ${status === 'in-process' ? 'selected' : ''}>In-process</option>
              <option value="hold" ${status === 'hold' ? 'selected' : ''}>Hold</option>
              <option value="complete" ${status === 'complete' ? 'selected' : ''}>Complete</option>
            </select>
            <button class="delete-task">Delete</button>
             <button class="edit-task" onclick='openTask()'>Edit</button>`;

        const statusDropdown = taskItem.querySelector('.status');
        statusDropdown.addEventListener('change', function() {
            taskItem.className = 'task'; // Reset class
            taskItem.classList.add(statusDropdown.value);
            updateTaskInLocalStorage(task, priority, deadline, statusDropdown.value);
        });

        const deleteButton = taskItem.querySelector('.delete-task');
        deleteButton.addEventListener('click', function() {
            deleteTask(taskItem, task, priority, deadline);
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

    function updateTaskInLocalStorage(task, priority, deadline, newStatus) {
        let tasks = localStorage.getItem('tasks');
        if (tasks) {
            tasks = JSON.parse(tasks);
            const taskIndex = tasks.findIndex(t => t.task === task && t.priority === priority && t.deadline === deadline);
            if (taskIndex > -1) {
                tasks[taskIndex].status = newStatus;
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
        }
    }

    function deleteTask(taskItem, task, priority, deadline) {
        taskItem.remove();
        let tasks = localStorage.getItem('tasks');
        if (tasks) {
            tasks = JSON.parse(tasks);
            tasks = tasks.filter(t => t.task !== task || t.priority !== priority || t.deadline !== deadline);
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    function displayStoredData() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            const tasks = JSON.parse(storedTasks);
            tasks.forEach(task => {
                const taskItem = createTaskElement(task.task, task.priority, task.deadline, task.status);
                taskList.appendChild(taskItem);
            });
        } else {
            taskList.innerHTML = '<p>No tasks stored.</p>';
        }
    }

    // Function to format the date to yyyy-MM-dd
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Close the form popup when the ESC key is pressed
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" || event.key === "Esc") {
            closeTask();
        }
    });

    // Display stored data on page load
    displayStoredData();
});

function openTask() {
    document.getElementById("myForm").style.display = "block";
}

function closeTask() {
    document.getElementById("myForm").style.display = "none";
}


