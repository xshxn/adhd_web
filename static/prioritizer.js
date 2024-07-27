document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const taskContainer = document.getElementById('task-container');
    let taskCount = 0;

    loadTasks();

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const content = document.getElementById('task-content').value;
        const deadline = document.getElementById('task-deadline').value;
        addTask(content, deadline);
    });

    function loadTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(tasks => {
                taskContainer.innerHTML = '';
                tasks.forEach(task => createTaskElement(task));
            });
    }

    function addTask(content, deadline) {
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, deadline }),
        })
        .then(response => response.json())
        .then(data => {
            createTaskElement({ id: data.id, content, deadline });
        });
    }

    function createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.classList.add('task');
        taskEl.textContent = task.content;
        
        // Set the deadline as a data attribute for the hover effect
        taskEl.setAttribute('data-deadline', task.deadline);
    
        const today = new Date();
        const deadlineDate = new Date(task.deadline);
        const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        let fontSize;
        if (daysUntilDeadline < 0) {
            // Task is overdue
            taskEl.classList.add('overdue');
            fontSize = 40; // Even bigger than the closest approaching task
        } else {
            fontSize = Math.max(16, Math.min(36, 36 - daysUntilDeadline));
        }
        
        taskEl.style.fontSize = `${fontSize}px`;
    
        const position = getTaskPosition(taskCount);
        taskEl.style.left = `${position.x}px`;
        taskEl.style.top = `${position.y}px`;
    
        taskEl.addEventListener('click', function() {
            completeTask(task.id, taskEl);
        });
    
        taskContainer.appendChild(taskEl);
        taskCount++;
    }

    function getTaskPosition(index) {
        const containerWidth = taskContainer.clientWidth;
        const containerHeight = taskContainer.clientHeight;

        if (index === 0) {
            // First task in the center
            return {
                x: containerWidth / 2 - 100,
                y: containerHeight / 2 - 20
            };
        } else {
            // Pseudo-random positions for subsequent tasks
            const angle = (index * 137.5) % 360; // Golden angle
            const radius = Math.min(containerWidth, containerHeight) * 0.4 * (index % 3 + 1) / 3;
            return {
                x: containerWidth / 2 + radius * Math.cos(angle * Math.PI / 180) - 100,
                y: containerHeight / 2 + radius * Math.sin(angle * Math.PI / 180) - 20
            };
        }
    }

    function completeTask(taskId, taskEl) {
        fetch(`/api/tasks/${taskId}`, { method: 'PUT' })
            .then(() => {
                taskEl.remove();
                taskCount--;
            });
    }
});