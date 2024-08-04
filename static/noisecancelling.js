document.addEventListener('DOMContentLoaded', function() {
    const soundCards = document.querySelectorAll('.sound-card');
    const playPauseBtn = document.getElementById('play-pause');
    const volumeSlider = document.getElementById('volume');
    const loopBtn = document.getElementById('loop');
    const progressBar = document.querySelector('.progress');
    const progressBarContainer = document.querySelector('.progress-bar');
    const currentSoundSpan = document.getElementById('current-sound');

    let audio = new Audio();
    let isPlaying = false;
    let currentSound = '';
    let activeCard = null; // Keep track of the currently active sound card

    soundCards.forEach(card => {
        card.addEventListener('click', () => {
            const soundFile = card.getAttribute('data-sound');
            if (currentSound !== soundFile) {
                currentSound = soundFile;
                audio.src = `/static/sounds/${soundFile}`;
                currentSoundSpan.textContent = card.querySelector('span').textContent;
                setActiveCard(card);
                playAudio();
            } else {
                togglePlayPause();
            }
        });
    });

    playPauseBtn.addEventListener('click', togglePlayPause);

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });

    loopBtn.addEventListener('click', () => {
        audio.loop = !audio.loop;
        loopBtn.classList.toggle('active', audio.loop);
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
    });

    progressBarContainer.addEventListener('mousedown', (e) => {
        const rect = progressBarContainer.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const newTime = (offsetX / rect.width) * audio.duration;
        audio.currentTime = newTime;
    });

    function togglePlayPause() {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    }

    function playAudio() {
        audio.play();
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    function setActiveCard(card) {
        if (activeCard) {
            activeCard.classList.remove('active');
        }
        card.classList.add('active');
        activeCard = card;
    }
});
