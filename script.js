/* =======================================
   YourNextStep.ai — Client-Side JS
   FAQ accordion, audio player, mobile nav
   ======================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initAudioPlayer();
  initAudioScriptToggle();
});

/* --- Mobile Navigation --- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('active');
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('active');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('active')) {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('active');
      toggle.focus();
    }
  });
}

/* --- Audio Player --- */
function initAudioPlayer() {
  const player = document.querySelector('.audio-player');
  if (!player) return;

  const audio = player.querySelector('audio');
  const btnPlay = player.querySelector('.btn-play');
  const progressBar = player.querySelector('.progress-bar');
  const progressFill = player.querySelector('.progress-fill');
  const timeCurrent = player.querySelector('.time-current');
  const timeDuration = player.querySelector('.time-duration');

  if (!audio || !btnPlay) return;

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  btnPlay.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      btnPlay.textContent = '⏸';
      btnPlay.setAttribute('aria-label', 'Pause audio briefing');
    } else {
      audio.pause();
      btnPlay.textContent = '▶';
      btnPlay.setAttribute('aria-label', 'Play audio briefing');
    }
  });

  // Keyboard: Space/Enter to toggle play
  btnPlay.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      btnPlay.click();
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (timeDuration) timeDuration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    btnPlay.textContent = '▶';
    btnPlay.setAttribute('aria-label', 'Play audio briefing');
    if (progressFill) progressFill.style.width = '0%';
  });

  // Click to seek
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    // Keyboard seek on progress bar
    progressBar.setAttribute('tabindex', '0');
    progressBar.setAttribute('role', 'slider');
    progressBar.setAttribute('aria-label', 'Audio progress');
    progressBar.addEventListener('keydown', (e) => {
      if (!audio.duration) return;
      if (e.key === 'ArrowRight') {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
      } else if (e.key === 'ArrowLeft') {
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
      }
    });
  }
}

/* --- Audio Script Toggle --- */
function initAudioScriptToggle() {
  const btn = document.querySelector('.audio-script-toggle');
  const script = document.querySelector('.audio-script');
  if (!btn || !script) return;

  btn.addEventListener('click', () => {
    const visible = script.classList.toggle('visible');
    btn.textContent = visible ? 'Hide transcript ▲' : 'Read transcript ▼';
    btn.setAttribute('aria-expanded', String(visible));
  });
}
