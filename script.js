const IMAGE_ROTATION_MIN = 10 * 60 * 1000; // Minimum time before changing wallpaper again (in milliseconds)

async function updateWallpaper() {
  const bgElement = document.getElementById('bg');
  bgElement.classList.add('fading');

  const wallpaperData = await fetchRandomWallpaper();
  const { url } = wallpaperData;

  setTimeout(() => {
    bgElement.style.backgroundImage = `url(${url})`;
    bgElement.classList.remove('fading');
  }, 1000);
}

async function generateText(typedInstance) {
  try {
    const quoteObj = await fetchRandomQuote();
    await updateWallpaper();

    const { quote, author } = quoteObj;

    typedInstance
      .pause(1000)
      .type(quote)
      .type(`<strong>- ${author}</strong>`)
      .pause(IMAGE_ROTATION_MIN)
      .flush(() => {
        typedInstance.reset();
        generateText(typedInstance);
      });
  } catch (error) {
    console.error('Error generating text:', error);
  }
}

function updateClock() {
  setInterval(() => {
    const formattedTime = getFormattedTime();
    document.getElementById('clock').innerText = formattedTime;
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  const typedInstance = new TypeIt('#typing', { speed: 40 });

  generateText(typedInstance);
  updateClock();
});

window.wallpaperPropertyListener = {
  applyUserProperties(properties) {
    if (properties.schemecolor) {
      const customColor = properties.schemecolor.value
        .split(' ')
        .map((c) => Math.ceil(c * 255));
      document.body.style.color = `rgb(${customColor})`;
    }
  },
};
