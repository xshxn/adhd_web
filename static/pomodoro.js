const workDisplay = document.getElementById('work-display');
const restDisplay = document.getElementById('rest-display');
const workTimeInput = document.getElementById('work-time');
const restTimeInput = document.getElementById('rest-time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

let timer;
let isRunning = false;
let isWorkPhase = true;
let secondsLeft;

function updateDisplays() {
    workDisplay.textContent = formatTime(workTimeInput.value * 60);
    restDisplay.textContent = formatTime(restTimeInput.value * 60);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.textContent = 'Pause';

    if (secondsLeft === undefined) {
        secondsLeft = workTimeInput.value * 60;
    }

    timer = setInterval(() => {
        if (secondsLeft > 0) {
            secondsLeft--;
            updateActiveDisplay();
        } else {
            switchPhase();
        }
    }, 1000);
}

function switchPhase() {
    isWorkPhase = !isWorkPhase;
    secondsLeft = (isWorkPhase ? workTimeInput.value : restTimeInput.value) * 60;
    updateActiveDisplay();
}

function updateActiveDisplay() {
    if (isWorkPhase) {
        workDisplay.textContent = formatTime(secondsLeft);
        workDisplay.classList.add('active');
        restDisplay.classList.remove('active');
    } else {
        restDisplay.textContent = formatTime(secondsLeft);
        restDisplay.classList.add('active');
        workDisplay.classList.remove('active');
    }
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
    secondsLeft = undefined;
    startBtn.textContent = 'Start';
    updateDisplays();
    workDisplay.classList.remove('active');
    restDisplay.classList.remove('active');
}

startBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);

workTimeInput.addEventListener('input', updateDisplays);
restTimeInput.addEventListener('input', updateDisplays);

updateDisplays();

container = document.querySelectorAll('.container')


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

        burger.classList.toggle('toggle');
    });
}

navSlide();