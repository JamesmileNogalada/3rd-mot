// Get DOM elements
const loveLetterIcon = document.getElementById('loveLetterIcon');

const letterModal = document.getElementById('letterModal');
const closeBtn = document.getElementById('closeBtn');

const teddyBear = document.getElementById('teddyBear');
const photoModal = document.getElementById('photoModal');
const closePhotoBtn = document.getElementById('closePhotoBtn');

const photoSlots = document.querySelectorAll('.photo-slot');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentIndex = 0;

// Open letter modal from love letter icon
// (Bound immediately, before anything else runs, so a later error
// elsewhere in this file can never prevent this from working.)
loveLetterIcon.addEventListener('click', () => {
    letterModal.classList.add('active');
});

// Close letter modal
closeBtn.addEventListener('click', () => {
    letterModal.classList.remove('active');
});

// Close letter modal when clicking outside
letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) {
        letterModal.classList.remove('active');
    }
});

// Open photo gallery from teddy bear
teddyBear.addEventListener('click', () => {
    photoModal.classList.add('active');
});

// Close photo gallery
closePhotoBtn.addEventListener('click', () => {
    photoModal.classList.remove('active');
});

// Close photo gallery when clicking outside
photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) {
        photoModal.classList.remove('active');
    }
});

// Background Music Logic
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let musicStarted = false;

function markPlaying() {
    musicStarted = true;
    musicToggle.textContent = '🎶';
    musicToggle.classList.add('playing');
}

function markPaused() {
    musicStarted = false;
    musicToggle.textContent = '🎵';
    musicToggle.classList.remove('playing');
}

// Trick: browsers always allow MUTED autoplay. Start muted, then unmute
// right after playback begins — this lets the sound start automatically
// on page load in most browsers, without needing a click first.
function attemptAutoplayWithSound() {
    bgMusic.muted = true;
    bgMusic.play().then(() => {
        setTimeout(() => {
            bgMusic.muted = false;
            markPlaying();
        }, 300);
    }).catch(() => {
        // Even muted autoplay was blocked (rare) — fall back to first interaction
    });
}

function playMusic() {
    bgMusic.muted = false;
    bgMusic.play().then(markPlaying).catch(() => {});
}

function pauseMusic() {
    bgMusic.pause();
    markPaused();
}

// Try automatic (muted-then-unmuted) playback as soon as the page loads
window.addEventListener('load', attemptAutoplayWithSound);
attemptAutoplayWithSound();

// Safety net: if the browser still blocked it, start on the first interaction
function startOnFirstInteraction() {
    if (!musicStarted) {
        playMusic();
    }
    document.removeEventListener('click', startOnFirstInteraction);
    document.removeEventListener('keydown', startOnFirstInteraction);
}
document.addEventListener('click', startOnFirstInteraction);
document.addEventListener('keydown', startOnFirstInteraction);

// Manual toggle button
musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bgMusic.paused) {
        playMusic();
    } else {
        pauseMusic();
    }
});



// On page load, check every pre-filled photo (src="photo1.jpg" etc.)
// If the image link/file is valid, keep it and make the slot clickable.
// If it's missing/broken, fall back to a "Photo coming soon" box.
document.querySelectorAll('.gallery-photo').forEach(img => {
    try {
        img.addEventListener('load', () => {
            const slot = img.closest('.photo-slot');
            if (slot) slot.classList.remove('is-empty');
        });

        img.addEventListener('error', () => {
            const slot = img.closest('.photo-slot');
            if (!slot) return;
            slot.classList.add('is-empty');
            slot.innerHTML = `
                <div class="photo-placeholder-slot">
                    <span class="plus-icon">📷</span>
                    <p>Photo coming soon</p>
                </div>
            `;
        });

        // In case the image was already cached/loaded before listeners attached
        if (img.complete) {
            if (img.naturalWidth === 0) {
                img.dispatchEvent(new Event('error'));
            }
        }
    } catch (err) {
        // Never let one broken photo take down the rest of the page's scripts
        console.error('Photo gallery item failed to initialize:', err);
    }
});


// Clicking a slot with a real photo opens the lightbox for that photo
photoSlots.forEach((slot, index) => {
    slot.addEventListener('click', () => {
        if (slot.classList.contains('is-empty')) return;
        openLightbox(index);
    });
});

function openLightbox(index) {
    currentIndex = index;
    const img = photoSlots[currentIndex].querySelector('.gallery-photo');
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.style.display = 'block';
}

function closeLightbox() {
    lightbox.style.display = 'none';
}

// Move to the next/previous slot that actually has a photo
function changeLightboxImage(step) {
    const total = photoSlots.length;
    let next = currentIndex;

    for (let i = 0; i < total; i++) {
        next = (next + step + total) % total;
        if (!photoSlots[next].classList.contains('is-empty')) {
            openLightbox(next);
            return;
        }
    }
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => changeLightboxImage(-1));
lightboxNext.addEventListener('click', () => changeLightboxImage(1));

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});


// Keyboard shortcuts
document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape') {

        letterModal.classList.remove('active');
        photoModal.classList.remove('active');
        closeLightbox();

    }

    if (lightbox.style.display === 'block') {
        if (e.key === 'ArrowLeft') changeLightboxImage(-1);
        if (e.key === 'ArrowRight') changeLightboxImage(1);
    }
});