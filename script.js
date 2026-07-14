const IMAGE_ROTATION_MIN = 10 * 60 * 1000; // Minimum time before changing wallpaper again (in milliseconds)
let typedInstance = null;
let isRandomizing = false;

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
  });
}

async function updateWallpaper() {
  const bgElement = document.getElementById('bg');

  try {
    const wallpaperData = await fetchRandomWallpaper();
    const { url, color } = wallpaperData;

    // Set the body background color to transition to the new color
    document.body.style.backgroundColor = color || '#555555';
    bgElement.classList.add('fading');

    // Preload the image in parallel with the 1s fade-out animation
    const fadeOutPromise = new Promise((resolve) => setTimeout(resolve, 1000));
    const preloadPromise = preloadImage(url);

    // Wait for both the fade-out and the image preloading to complete
    await Promise.all([fadeOutPromise, preloadPromise]);

    bgElement.style.backgroundImage = `url(${url})`;
    bgElement.classList.remove('fading');
  } catch (error) {
    console.error('Error updating wallpaper:', error);
    bgElement.classList.remove('fading');
  }
}

let countdownInterval = null;
let showCountdown = false;
let nextChangeTime = 0;

function updateCountdownDisplay() {
  const el = document.getElementById('countdown');
  if (!el) return;

  if (!showCountdown) {
    el.style.display = 'none';
    return;
  }

  const timeLeft = nextChangeTime - Date.now();
  if (timeLeft <= 0) {
    el.style.display = 'none';
    return;
  }

  el.style.display = 'block';
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  el.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startCountdown(duration) {
  nextChangeTime = Date.now() + duration;
  if (countdownInterval) clearInterval(countdownInterval);
  updateCountdownDisplay();
  countdownInterval = setInterval(updateCountdownDisplay, 200);
}

async function generateText() {
  try {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    const el = document.getElementById('countdown');
    if (el) el.style.display = 'none';

    // Recreate the TypeIt instance to completely clear the queue and avoid duplicate queue execution
    if (typedInstance) {
      typedInstance.destroy();
    }
    document.getElementById('typing').innerHTML = '';
    typedInstance = new TypeIt('#typing', { speed: 40 });

    const quoteObj = await fetchRandomQuote();
    await updateWallpaper();

    const { quote, author } = quoteObj;

    typedInstance
      .pause(1000)
      .type(quote)
      .type(`<strong>- ${author}</strong>`)
      .exec(() => {
        const cursor = document.querySelector('.ti-cursor');
        if (cursor) cursor.style.display = 'none';
        startCountdown(IMAGE_ROTATION_MIN);
      })
      .pause(IMAGE_ROTATION_MIN)
      .flush(() => {
        generateText();
      });
  } catch (error) {
    console.error('Error generating text:', error);
    // Retry after 5 seconds on error
    setTimeout(generateText, 5000);
  }
}

async function triggerRandomize() {
  if (isRandomizing) return;
  isRandomizing = true;

  const btn = document.getElementById('randomize-btn');
  if (btn) btn.classList.add('spinning');

  try {
    await generateText();
  } catch (error) {
    console.error('Error triggering randomize:', error);
  } finally {
    // Keep spin active for at least 1s for visual feedback
    setTimeout(() => {
      if (btn) btn.classList.remove('spinning');
      isRandomizing = false;
    }, 1000);
  }
}

function updateClock() {
  setInterval(() => {
    const formattedTime = getFormattedTime();
    document.getElementById('clock').innerText = formattedTime;
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  generateText();
  updateClock();

  const randomizeBtn = document.getElementById('randomize-btn');
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', triggerRandomize);
  }
});

let currentBgType = 'panel';
let currentPanelColor = 'rgba(10, 10, 10, 0.6)';

function applyStyleConfiguration() {
  const elements = [
    { id: 'clock', pad: '0.5rem 1rem' },
    { id: 'typing', pad: '1rem' },
    { id: 'countdown', pad: '0.5rem 1rem' }
  ];

  elements.forEach((item) => {
    const el = document.getElementById(item.id);
    if (!el) return;

    if (currentBgType === 'panel') {
      el.style.backgroundColor = currentPanelColor;
      el.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7), -1px -1px 3px rgba(0, 0, 0, 0.5)';
      el.style.padding = item.pad;
      el.style.borderRadius = '0.5rem';
    } else {
      el.style.backgroundColor = 'transparent';
      el.style.textShadow = `2px 2px 6px ${currentPanelColor}, -1px -1px 4px ${currentPanelColor}`;
      el.style.padding = '0';
      el.style.borderRadius = '0';
    }
  });
}

let initialSourceApplied = false;

window.wallpaperPropertyListener = {
  applyUserProperties(properties) {
    if (properties.schemecolor) {
      const customColor = properties.schemecolor.value
        .split(' ')
        .map((c) => Math.ceil(c * 255));
      document.body.style.color = `rgb(${customColor})`;
    }

    if (properties.clockfont) {
      const selectedFont = properties.clockfont.value;
      const clockElement = document.getElementById('clock');
      const fontMapping = {
        sharetechmono: "'Share Tech Mono', monospace",
        firacode: "'Fira Code', monospace",
        jetbrainsmono: "'JetBrains Mono', monospace",
        robotomono: "'Roboto Mono', monospace",
        sourcecodepro: "'Source Code Pro', monospace",
        inconsolata: "'Inconsolata', monospace",
        ibmplexmono: "'IBM Plex Mono', monospace",
        courierprime: "'Courier Prime', monospace",
        vt323: "'VT323', monospace",
        spacemono: "'Space Mono', monospace",
        monospace: "monospace"
      };

      if (clockElement && fontMapping[selectedFont]) {
        clockElement.style.fontFamily = fontMapping[selectedFont];
      }
    }

    if (properties.wallpapersource) {
      const newSource = properties.wallpapersource.value;
      if (initialSourceApplied && currentWallpaperSource !== newSource) {
        currentWallpaperSource = newSource;
        triggerRandomize();
      } else {
        currentWallpaperSource = newSource;
        initialSourceApplied = true;
      }
    }

    if (properties.showcountdown) {
      showCountdown = properties.showcountdown.value;
      updateCountdownDisplay();
    }

    if (properties.bgtype) {
      currentBgType = properties.bgtype.value;
      applyStyleConfiguration();
    }

    if (properties.panelcolor) {
      const rgb = properties.panelcolor.value.split(' ').map((c) => Math.ceil(c * 255));
      currentPanelColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)`;
      applyStyleConfiguration();
    }
  },
};


