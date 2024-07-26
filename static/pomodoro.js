const timerDisplay = document.getElementById('timer-display');
const phaseDisplay = document.getElementById('phase-display');
const workTimeInput = document.getElementById('work-time');
const restTimeInput = document.getElementById('rest-time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

let timer;
let isRunning = false;
let isWorkPhase = true;
let timeLeft;

function updateTimerDisplay() {
    const minutes = isWorkPhase ? workTimeInput.value : restTimeInput.value;
    timerDisplay.textContent = formatTime(minutes * 60);
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startBtn.textContent = 'Pause';

    if (!timeLeft) {
        timeLeft = (isWorkPhase ? workTimeInput.value : restTimeInput.value) * 60;
    }
    phaseDisplay.textContent = isWorkPhase ? 'Work' : 'Rest';

    updateDisplay();

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft === 0) {
            clearInterval(timer);
            isWorkPhase = !isWorkPhase;
            phaseDisplay.textContent = isWorkPhase ? 'Work' : 'Rest';
            timeLeft = (isWorkPhase ? workTimeInput.value : restTimeInput.value) * 60;
            startTimer(); // Automatically start the next phase
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = 'Resume';
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isWorkPhase = true;
    startBtn.textContent = 'Start';
    phaseDisplay.textContent = 'Work';
    timeLeft = null;
    updateTimerDisplay();
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

startBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);

// Update timer display when input changes
workTimeInput.addEventListener('input', updateTimerDisplay);
restTimeInput.addEventListener('input', updateTimerDisplay);

// Initialize display
timerDisplay.textContent = '00:00';
phaseDisplay.textContent = 'Work';