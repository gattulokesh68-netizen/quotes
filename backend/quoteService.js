const axios = require('axios');

// External API configuration
const QUOTABLE_API = 'https://api.quotable.io/random';

/**
 * Fetch a random quote from the Quotable API
 * @returns {Promise<object>} - Quote object with text and author
 */
async function getRandomQuote() {
  try {
    const response = await axios.get(QUOTABLE_API, {
      timeout: 5000
    });

    const { content, author } = response.data;

    if (!content || !author) {
      throw new Error('Invalid quote data received from API');
    }

    return {
      text: content,
      author: author.replace(', type.author', '').trim(), // Clean author name
      source: 'quotable.io'
    };
  } catch (error) {
    console.error('Error fetching quote from API:', error.message);
    throw new Error(`Failed to fetch quote: ${error.message}`);
  }
}

/**
 * Fetch multiple random quotes
 * @param {number} count - Number of quotes to fetch
 * @returns {Promise<Array>} - Array of quote objects
 */
async function getMultipleQuotes(count = 5) {
  const quotes = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const quote = await getRandomQuote();
      quotes.push(quote);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`Failed to fetch quote ${i + 1}:`, error.message);
    }
  }
  
  return quotes;
}

/**
 * Fetch a quote by search term
 * @param {string} query - Search query
 * @returns {Promise<object>} - Quote object
 */
async function searchQuote(query) {
  try {
    const response = await axios.get('https://api.quotable.io/quotes', {
      params: {
        query: query,
        limit: 1
      },
      timeout: 5000
    });

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('No quotes found for the search query');
    }

    const { content, author } = response.data.results[0];

    return {
      text: content,
      author: author.replace(', type.author', '').trim(),
      source: 'quotable.io'
    };
  } catch (error) {
    console.error('Error searching for quote:', error.message);
    throw new Error(`Failed to search quote: ${error.message}`);
  }
}

module.exports = {
  getRandomQuote,
  getMultipleQuotes,
  searchQuote
};