const tools = [
    { name: "Pomodoro Timer", description: "Break your work into focused intervals.", url: "pomodoro" },
    { name: "Task Prioritizer", description: "Organize your tasks by importance and urgency.", url: "prioritizer" },
    { name: "White Noise", description: "Block out distractions with ambient sounds.", url: "noisecancelling" },
    { name: "Habit Tracker", description: "Build and maintain positive habits.", url: "habits" }
];

const toolsGrid = document.getElementById('toolsGrid');

function getRandomDarkColor() {
    const hue = Math.floor(Math.random() * 360);
    
    const lightness = Math.floor(Math.random() * 20) + 10; 
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
        <div>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
        </div>
        <div>
            <a href="${tool.url}" class="cta-button" target = "_blank" rel = "noopener noreferrer">Try</a>
        </div>
    `;
    toolsGrid.appendChild(toolCard);
});