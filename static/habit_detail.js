const habitImage = document.getElementById('habit-image');
const missButton = document.getElementById('miss-day-btn');
const targetDateSpan = document.getElementById('target-date');

function updateImage() {
    // Check if the image has loaded successfully
    if (habitImage.naturalWidth === 0) {
        console.error('Image failed to load. Path:', habitImage.src);
        return; // Exit the function if the image hasn't loaded
    }

    const targetDate = new Date(targetDateSpan.textContent);
    const today = new Date();
    const totalDays = habitImage.naturalWidth;
    const daysElapsed = Math.floor((today - new Date(habitImage.src.split('_').pop().split('.')[0])) / (1000 * 60 * 60 * 24));

    const canvas = document.createElement('canvas');
    canvas.width = habitImage.naturalWidth;
    canvas.height = habitImage.naturalHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(habitImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let x = 0; x < daysElapsed && x < totalDays; x++) {
        for (let y = 0; y < canvas.height; y++) {
            const i = (y * canvas.width + x) * 4;
            if (data[i] < 200) {  // Only color non-white pixels
                const hue = (x / totalDays) * 360;
                const [r, g, b] = hslToRgb(hue / 360, 1, 0.5);
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    habitImage.src = canvas.toDataURL();
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

missButton.addEventListener('click', function() {
    const habitId = window.location.pathname.split('/').pop();
    fetch(`/api/habit/${habitId}/miss_day`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        targetDateSpan.textContent = data.new_target;
        updateImage();
    });
});

habitImage.onload = updateImage;

updateImage();