const tools = [
    { name: "Pomodoro Timer", description: "Break your work into focused intervals." },
    { name: "Task Prioritizer", description: "Organize your tasks by importance and urgency." },
    { name: "Mindfulness App", description: "Practice mindfulness to improve focus." },
    { name: "Noise-Cancelling Audio", description: "Block out distractions with ambient sounds." },
    { name: "Visual Schedule Maker", description: "Create visual timetables for better time management." },
    { name: "Habit Tracker", description: "Build and maintain positive habits." }
];

const toolsGrid = document.getElementById('toolsGrid');

function getRandomDarkColor() {
    // Generate a random hue
    const hue = Math.floor(Math.random() * 360);
    // Use a low lightness value to ensure dark colors
    const lightness = Math.floor(Math.random() * 20) + 10; // 10-30% lightness
    return `hsl(${hue}, 70%, ${lightness}%)`;
}

function getRandomDarkGradient() {
    const color1 = getRandomDarkColor();
    const color2 = getRandomDarkColor();
    return `linear-gradient(135deg, ${color1}, ${color2})`;
}

tools.forEach(tool => {
    const toolCard = document.createElement('div');
    toolCard.className = 'tool-card';
    toolCard.style.background = getRandomDarkGradient();
    toolCard.innerHTML = `
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
        <a href="#" class="cta-button">Learn More</a>
    `;
    toolsGrid.appendChild(toolCard);
});