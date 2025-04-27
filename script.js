document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const pendingTasksList = document.getElementById('pendingTasks');
    const completedTasksList = document.getElementById('completedTasks');
    
    loadTasks();
    
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        
        if (taskText) {
            addTask(taskText);
            taskInput.value = '';
            taskInput.focus();
        }
    });
    
    function addTask(text, isCompleted = false, id = Date.now()) {
        const taskItem = createTaskElement(text, isCompleted, id);
        
        if (isCompleted) {
            completedTasksList.appendChild(taskItem);
        } else {
            pendingTasksList.appendChild(taskItem);
        }
        
        updateNoTasksMessage();
        saveTasks();
    }
    
    function createTaskElement(text, isCompleted, id) {
        const li = document.createElement('li');
        li.className = `task-item ${isCompleted ? 'completed' : ''}`;
        li.dataset.id = id;
        
        const taskText = document.createElement('span');
        taskText.className = `task-text ${isCompleted ? 'completed' : ''}`;
        taskText.textContent = text;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = `task-btn toggle-btn ${isCompleted ? 'undo' : ''}`;
        toggleBtn.innerHTML = isCompleted ? '↩' : '✓';
        toggleBtn.title = isCompleted ? 'Mark Pending' : 'Complete';
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleTaskStatus(li);
        });
        actionsDiv.appendChild(toggleBtn);
        
        if (!isCompleted) {
            const editBtn = document.createElement('button');
            editBtn.className = 'task-btn edit-btn';
            editBtn.innerHTML = '✎';
            editBtn.title = 'Edit';
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                editTask(li, taskText);
            });
            actionsDiv.appendChild(editBtn);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-btn delete-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTask(li);
        });
        actionsDiv.appendChild(deleteBtn);
        
        li.addEventListener('click', function() {
            toggleTaskStatus(li);
        });
        
        li.appendChild(taskText);
        li.appendChild(actionsDiv);
        
        return li;
    }
    
    function toggleTaskStatus(taskItem) {
        const isCompleted = taskItem.classList.contains('completed');
        const text = taskItem.querySelector('.task-text').textContent;
        const id = taskItem.dataset.id;
        
        taskItem.remove();
        addTask(text, !isCompleted, id);
    }
    
    function editTask(taskItem, taskTextElement) {
        const currentText = taskTextElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = currentText;
        
        taskTextElement.replaceWith(input);
        input.focus();
        
        const handleEdit = function() {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                taskTextElement.textContent = newText;
                saveTasks();
            }
            input.replaceWith(taskTextElement);
            input.removeEventListener('blur', handleEdit);
            input.removeEventListener('keypress', handleKeyPress);
        };
        
        const handleKeyPress = function(e) {
            if (e.key === 'Enter') {
                handleEdit();
            }
        };
        
        input.addEventListener('blur', handleEdit);
        input.addEventListener('keypress', handleKeyPress);
    }
    
    function deleteTask(taskItem) {
        if (confirm('Are you sure you want to delete this task?')) {
            taskItem.remove();
            updateNoTasksMessage();
            saveTasks();
        }
    }
    
    function updateNoTasksMessage() {
        const pendingNoTasks = pendingTasksList.querySelector('.no-tasks');
        const completedNoTasks = completedTasksList.querySelector('.no-tasks');
        
        if (pendingTasksList.children.length === 0) {
            if (!pendingNoTasks) {
                const noTasksMsg = document.createElement('li');
                noTasksMsg.className = 'no-tasks';
                noTasksMsg.textContent = 'No pending tasks';
                pendingTasksList.appendChild(noTasksMsg);
            }
        } else if (pendingNoTasks) {
            pendingNoTasks.remove();
        }
        
        if (completedTasksList.children.length === 0) {
            if (!completedNoTasks) {
                const noTasksMsg = document.createElement('li');
                noTasksMsg.className = 'no-tasks';
                noTasksMsg.textContent = 'No completed tasks';
                completedTasksList.appendChild(noTasksMsg);
            }
        } else if (completedNoTasks) {
            completedNoTasks.remove();
        }
    }
    
    function saveTasks() {
        const tasks = [];
        
        // Get pending tasks
        const pendingItems = pendingTasksList.querySelectorAll('.task-item:not(.no-tasks)');
        pendingItems.forEach(item => {
            tasks.push({
                id: item.dataset.id,
                text: item.querySelector('.task-text').textContent,
                completed: false
            });
        });
        
        const completedItems = completedTasksList.querySelectorAll('.task-item:not(.no-tasks)');
        completedItems.forEach(item => {
            tasks.push({
                id: item.dataset.id,
                text: item.querySelector('.task-text').textContent,
                completed: true
            });
        });
        
        localStorage.setItem('businessTasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        const savedTasks = localStorage.getItem('businessTasks');
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            
            pendingTasksList.querySelectorAll('.task-item:not(.no-tasks)').forEach(item => item.remove());
            completedTasksList.querySelectorAll('.task-item:not(.no-tasks)').forEach(item => item.remove());
            
            tasks.forEach(task => {
                addTask(task.text, task.completed, task.id);
            });
        }
    }
});