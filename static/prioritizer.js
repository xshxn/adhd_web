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
            fontSize = 44; // Larger font size for overdue tasks
        } else {
            fontSize = Math.max(10, Math.min(40, 40 - daysUntilDeadline));
        }

        taskEl.style.fontSize = `${fontSize}px`;

        // Get position and ensure no overlap
        let position;
        let attempts = 0;
        do {
            position = getTaskPosition(taskCount);
            attempts++;
        } while (isOverlapping(taskEl, position) && attempts < 100); // Limit attempts to avoid infinite loops

        taskEl.style.left = `${position.x}px`;
        taskEl.style.top = `${position.y}px`;

        taskEl.addEventListener('click', function () {
            completeTask(task.id, taskEl);
        });

        taskContainer.appendChild(taskEl);
        taskCount++;
    }

    function isOverlapping(taskEl, position) {
        taskEl.style.left = `${position.x}px`;
        taskEl.style.top = `${position.y}px`;
        taskContainer.appendChild(taskEl);

        const taskRect = taskEl.getBoundingClientRect();
        const containerRect = taskContainer.getBoundingClientRect();
        taskContainer.removeChild(taskEl);

        // Check if the task goes out of the container bounds
        if (taskRect.left < containerRect.left || taskRect.right > containerRect.right ||
            taskRect.top < containerRect.top || taskRect.bottom > containerRect.bottom) {
            return true;
        }

        // Check if the task overlaps with any existing tasks
        const tasks = document.querySelectorAll('.task');
        for (let task of tasks) {
            const rect = task.getBoundingClientRect();
            if (taskRect.left < rect.right && taskRect.right > rect.left &&
                taskRect.top < rect.bottom && taskRect.bottom > rect.top) {
                return true;
            }
        }
        return false;
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
            const radius = Math.min(containerWidth, containerHeight) * 0.7 * (index % 3 + 1) / 3;
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

const container = document.querySelectorAll('#task-form')


container.forEach(cont => {
    cont.style.background = 'rgba(255, 255, 255, 0.9)';
    cont.style.color = '#333';
})

const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });
}

navSlide();
