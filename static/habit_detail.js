const targetDateSpan = document.getElementById('target-date');
const creationDateSpan = document.getElementById('creation-date');
const habitGrid = document.getElementById('habit-grid');
const missButton = document.getElementById('miss-day-btn');

function updateGrid() {
    const targetDate = new Date(targetDateSpan.textContent);
    const creationDate = new Date(creationDateSpan.textContent);
    const today = new Date();

    const totalDays = Math.ceil((targetDate - creationDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today - creationDate) / (1000 * 60 * 60 * 24));

    habitGrid.innerHTML = ''; // Clear existing squares

    // Calculate grid dimensions
    const gridWidth = Math.ceil(Math.sqrt(totalDays));
    habitGrid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;

    for (let i = 0; i < totalDays; i++) {
        const square = document.createElement('div');
        square.className = 'day-square';
        square.style.backgroundColor = i < daysElapsed ? '#2ecc71' : '#e74c3c';
        
        // Add tooltip
        const date = new Date(creationDate);
        date.setDate(date.getDate() + i);
        square.title = date.toDateString();

        habitGrid.appendChild(square);
    }
}

missButton.addEventListener('click', function() {
    const habitId = window.location.pathname.split('/').pop();
    fetch(`/api/habit/${habitId}/miss_day`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        targetDateSpan.textContent = data.new_target;
        updateGrid();
    });
});

updateGrid();