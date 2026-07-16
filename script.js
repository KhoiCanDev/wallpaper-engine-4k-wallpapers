let imageRotationTime = 10 * 60 * 1000; // Minimum time before changing wallpaper again (in milliseconds)
let typedInstance = null;
let isRandomizing = false;

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
let bottomLeftMode = 'off';
let weatherLocation = '';
let weatherFetchInterval = null;
let nextChangeTime = 0;

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if ([1, 2, 3].includes(code)) return '⛅';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 80, 81, 82].includes(code)) return '🌦️';
  if ([56, 57, 66, 67].includes(code)) return '🧊';
  if ([61, 63, 65].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌡️';
}

async function fetchWeather() {
  const el = document.getElementById('countdown');
  if (!el) return;

  if (bottomLeftMode !== 'weather') {
    return;
  }

  try {
    let lat = 51.5074; // Default to London
    let lon = -0.1278;
    const loc = weatherLocation.trim();
    let hasCoords = false;

    if (loc && loc.includes(',')) {
      const parts = loc.split(',');
      if (parts.length === 2) {
        const parsedLat = parseFloat(parts[0]);
        const parsedLon = parseFloat(parts[1]);
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          lat = parsedLat;
          lon = parsedLon;
          hasCoords = true;
        }
      }
    }

    if (!hasCoords) {
      // Auto-IP Geolocation
      try {
        const ipRes = await fetch('https://ip-api.com/json/');
        const ipData = await ipRes.json();
        if (ipData.lat !== undefined && ipData.lon !== undefined) {
          lat = ipData.lat;
          lon = ipData.lon;
        }
      } catch (err) {
        console.error('IP Geolocation failed, using default:', err);
      }
    }

    // Query Open-Meteo Forecast API
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const response = await fetch(forecastUrl);
    if (response.ok) {
      const data = await response.json();
      if (data && data.current) {
        const temp = Math.round(data.current.temperature_2m);
        const emoji = getWeatherEmoji(data.current.weather_code);
        if (bottomLeftMode === 'weather') {
          el.innerText = `${emoji} ${temp}°C`;
          el.style.display = 'block';
        }
      }
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
}

function startWeatherLoop() {
  if (weatherFetchInterval) clearInterval(weatherFetchInterval);
  fetchWeather();
  weatherFetchInterval = setInterval(fetchWeather, 15 * 60 * 1000);
}

function stopWeatherLoop() {
  if (weatherFetchInterval) {
    clearInterval(weatherFetchInterval);
    weatherFetchInterval = null;
  }
}

function updateCountdownDisplay() {
  const el = document.getElementById('countdown');
  if (!el) return;

  if (bottomLeftMode !== 'countdown') {
    if (bottomLeftMode !== 'weather') {
      el.style.display = 'none';
    }
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
    if (bottomLeftMode === 'countdown') {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      const el = document.getElementById('countdown');
      if (el) el.style.display = 'none';
    }

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
        if (bottomLeftMode === 'countdown') {
          startCountdown(imageRotationTime);
        }
      })
      .pause(imageRotationTime)
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

let isInitialLoad = true;

window.wallpaperPropertyListener = {
  applyUserProperties(properties) {
    if (properties.schemecolor) {
      const customColor = properties.schemecolor.value
        .split(' ')
        .map((c) => Math.ceil(c * 255));
      document.body.style.color = `rgb(${customColor})`;
    }

    if (properties.clockfont) {
      const el = document.getElementById('clock');
      if (el && fontMapping[properties.clockfont.value]) {
        el.style.fontFamily = fontMapping[properties.clockfont.value];
      }
    }

    if (properties.quotefont) {
      const el = document.getElementById('typing');
      if (el && fontMapping[properties.quotefont.value]) {
        el.style.fontFamily = fontMapping[properties.quotefont.value];
      }
    }

    if (properties.countdownfont) {
      const el = document.getElementById('countdown');
      if (el && fontMapping[properties.countdownfont.value]) {
        el.style.fontFamily = fontMapping[properties.countdownfont.value];
      }
    }

    if (properties.wallpapersource) {
      const newSource = properties.wallpapersource.value;
      if (!isInitialLoad && currentWallpaperSource !== newSource) {
        currentWallpaperSource = newSource;
        triggerRandomize();
      } else {
        currentWallpaperSource = newSource;
      }
    }

    if (properties.rotationtime) {
      const newMinutes = parseInt(properties.rotationtime.value);
      const newRotationTime = newMinutes * 60 * 1000;
      if (!isInitialLoad && imageRotationTime !== newRotationTime) {
        imageRotationTime = newRotationTime;
        triggerRandomize();
      } else {
        imageRotationTime = newRotationTime;
      }
    }

    if (properties.bottomleftmode) {
      bottomLeftMode = properties.bottomleftmode.value;

      const el = document.getElementById('countdown');
      if (el) el.style.display = 'none';

      if (bottomLeftMode === 'countdown') {
        stopWeatherLoop();
        updateCountdownDisplay();
      } else if (bottomLeftMode === 'weather') {
        startWeatherLoop();
      } else {
        stopWeatherLoop();
      }
    }

    if (properties.weatherlocation) {
      const newLoc = properties.weatherlocation.value;
      if (!isInitialLoad && weatherLocation !== newLoc) {
        weatherLocation = newLoc;
        if (bottomLeftMode === 'weather') {
          fetchWeather();
        }
      } else {
        weatherLocation = newLoc;
      }
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

    isInitialLoad = false;
  },
};


