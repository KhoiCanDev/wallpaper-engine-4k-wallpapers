const IMAGE_ROTATION_MIN = 10 * 60 * 1000; // Minimum time before changing wallpaper again (in milliseconds)
const QUOTE_CLEANUP_REGEX = /"|“|”/gm;

function extractQuotes(htmlString) {
  const parsedElements = $.parseHTML(htmlString);
  const $elements = $(parsedElements);

  const quotes = [];

  $elements.find('.quoteText').each(function (index, element) {
    const $element = $(element);
    const quoteWithAuthorText = $element
      .html()
      .trim()
      .replaceAll(QUOTE_CLEANUP_REGEX, '');
    const authorElement = $element.children('.authorOrTitle');
    const [quote] = quoteWithAuthorText.split('―');

    if (quote && authorElement) {
      quotes.push({
        quote: quote.trim(),
        author: authorElement.text().replaceAll(',', '').trim(),
      });
    }
  });

  return quotes;
}

const getRandomQuote = (extractedQuotes) => {
  if (!Array.isArray(extractedQuotes) || extractedQuotes.length === 0) {
    return { quote: 'No quotes available', author: 'Computer' };
  }

  // Generate a random index to select a random quote from the array
  const randomIndex = Math.floor(Math.random() * extractedQuotes.length);

  // Retrieve and return the randomly selected quote object
  return extractedQuotes[randomIndex];
};

async function fetchRandomQuote() {
  const randomPage = Math.floor(Math.random() * 100) + 1;
  const response = await fetch(
    `https://www.goodreads.com/quotes?page=${randomPage}`
  );
  const htmlContent = await response.text();
  const extractedQuotes = extractQuotes(htmlContent);
  const randomQuote = getRandomQuote(extractedQuotes);
  return randomQuote;
}

async function fetchRandomWallpaper() {
  const response = await fetch(
    'https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=random'
  );
  return response.json();
}

function getFormattedTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

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
