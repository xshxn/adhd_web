document.getElementById('habits-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('habit-name').value;
    const target = document.getElementById('habit-target').value;
    
    fetch('/api/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name: name, target: target}),
    })
    .then(response => response.json())
    .then(data => {
        loadHabits();
        document.getElementById('habit-name').value = '';
        document.getElementById('habit-target').value = '';
    });
});

function loadHabits() {
    fetch('/api/habits')
    .then(response => response.json())
    .then(habits => {
        const habitsList = document.getElementById('habits-list');
        habitsList.innerHTML = '';
        habits.forEach(habit => {
            const card = document.createElement('div');
            card.className = 'habit-card';
            card.textContent = `${habit.name} - Target: ${habit.target}`;
            card.addEventListener('click', () => {
                window.location.href = `/habit/${habit.id}`;
            });
            habitsList.appendChild(card);
        });
    });
}

loadHabits();

