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