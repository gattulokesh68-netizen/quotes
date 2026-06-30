const express = require('express');
const router = express.Router();
const {
  saveQuote,
  getAllQuotes,
  getQuoteById,
  deleteQuote,
  getStatistics
} = require('./database');
const { getRandomQuote, searchQuote } = require('./quoteService');

/**
 * GET /api/quote
 * Fetch a random quote from external API and save to database
 */
router.get('/quote', async (req, res) => {
  try {
    // Fetch from external API
    const quoteData = await getRandomQuote();

    // Save to database
    const savedQuote = await saveQuote(
      quoteData.text,
      quoteData.author,
      quoteData.source
    );

    res.json({
      message: 'Quote fetched and saved successfully',
      quote: savedQuote
    });
  } catch (error) {
    console.error('Error in /quote endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch quote',
      message: error.message
    });
  }
});

/**
 * GET /api/history
 * Retrieve all quotes from database
 */
router.get('/history', async (req, res) => {
  try {
    const quotes = await getAllQuotes();
    res.json({
      count: quotes.length,
      quotes: quotes
    });
  } catch (error) {
    console.error('Error in /history endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve quote history',
      message: error.message
    });
  }
});

/**
 * GET /api/quote/:id
 * Get a specific quote by ID
 */
router.get('/quote/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await getQuoteById(id);

    if (!quote) {
      return res.status(404).json({
        error: 'Quote not found',
        id: id
      });
    }

    res.json(quote);
  } catch (error) {
    console.error('Error in /quote/:id endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve quote',
      message: error.message
    });
  }
});

/**
 * DELETE /api/quote/:id
 * Delete a quote from history
 */
router.delete('/quote/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteQuote(id);

    if (!success) {
      return res.status(404).json({
        error: 'Quote not found',
        id: id
      });
    }

    res.json({
      message: 'Quote deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error in DELETE /quote/:id endpoint:', error);
    res.status(500).json({
      error: 'Failed to delete quote',
      message: error.message
    });
  }
});

/**
 * POST /api/search
 * Search for quotes by keyword
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const quoteData = await searchQuote(query);
    const savedQuote = await saveQuote(
      quoteData.text,
      quoteData.author,
      quoteData.source
    );

    res.json({
      message: 'Quote found and saved successfully',
      quote: savedQuote
    });
  } catch (error) {
    console.error('Error in /search endpoint:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * GET /api/stats
 * Get statistics about saved quotes
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStatistics();
    res.json({
      message: 'Quote statistics',
      stats: stats
    });
  } catch (error) {
    console.error('Error in /stats endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/docs
 * API documentation
 */
router.get('/docs', (req, res) => {
  res.json({
    title: 'Quotes API Documentation',
    version: '1.0.0',
    description: 'API for fetching random quotes and managing quote history',
    endpoints: [
      {
        method: 'GET',
        path: '/api/quote',
        description: 'Fetch a random quote and save to database',
        response: '{ quote: { id, text, author, savedAt } }'
      },
      {
        method: 'GET',
        path: '/api/history',
        description: 'Get all saved quotes',
        response: '{ count, quotes: [...] }'
      },
      {
        method: 'GET',
        path: '/api/quote/:id',
        description: 'Get a specific quote by ID',
        response: '{ id, text, author, savedAt }'
      },
      {
        method: 'DELETE',
        path: '/api/quote/:id',
        description: 'Delete a quote from history',
        response: '{ message, id }'
      },
      {
        method: 'POST',
        path: '/api/search',
        description: 'Search for quotes by keyword',
        body: '{ query: string }',
        response: '{ quote: { id, text, author, savedAt } }'
      },
      {
        method: 'GET',
        path: '/api/stats',
        description: 'Get quote statistics',
        response: '{ stats: { total, uniqueAuthors } }'
      }
    ]
  });
});

module.exports = router;
