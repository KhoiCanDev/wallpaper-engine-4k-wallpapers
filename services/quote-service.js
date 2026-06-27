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
      const trimmedQuote = quote.trim();
      const wordCount = trimmedQuote.split(/\s+/).length;
      if (wordCount <= 50) {
        quotes.push({
          quote: trimmedQuote,
          author: authorElement.text().replaceAll(',', '').trim(),
        });
      }
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
  let attempts = 0;
  while (attempts < 5) {
    const randomPage = Math.floor(Math.random() * 100) + 1;
    try {
      const response = await fetch(
        `https://www.goodreads.com/quotes?page=${randomPage}`
      );
      const htmlContent = await response.text();
      const extractedQuotes = extractQuotes(htmlContent);
      if (extractedQuotes.length > 0) {
        return getRandomQuote(extractedQuotes);
      }
    } catch (error) {
      console.error('Error fetching quotes page:', error);
    }
    attempts++;
  }
  return { quote: 'No short quotes available', author: 'Computer' };
}