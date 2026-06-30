const IMAGE_ROTATION_MIN = 10 * 60 * 1000; // Minimum time before changing wallpaper again (in milliseconds)
let typedInstance = null;
let isRandomizing = false;

async function updateWallpaper() {
  const bgElement = document.getElementById('bg');

  try {
    const wallpaperData = await fetchRandomWallpaper();
    const { url, color } = wallpaperData;

    // Set the body background color to transition to the new color
    document.body.style.backgroundColor = color || '#555555';
    bgElement.classList.add('fading');

    return new Promise((resolve) => {
      setTimeout(() => {
        bgElement.style.backgroundImage = `url(${url})`;
        bgElement.classList.remove('fading');
        resolve();
      }, 1000);
    });
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
    bgElement.classList.remove('fading');
  }
}

async function generateText() {
  try {
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
  },
};


