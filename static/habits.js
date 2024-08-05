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
            card.innerHTML = `
                <h3>${habit.name}</h3>
                <p>Target: ${habit.target}</p>
            `;
            card.addEventListener('click', () => {
                window.location.href = `/habit/${habit.id}`;
            });
            habitsList.appendChild(card);
        });
    });
}

loadHabits();

// Navigation functionality
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        burger.classList.toggle('toggle');
    });
}

navSlide();