// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const spinner = document.getElementById('spinner');
const toast = document.getElementById('toast');
const totalQuotesEl = document.getElementById('totalQuotes');
const uniqueAuthorsEl = document.getElementById('uniqueAuthors');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchNewQuote();
  updateStats();
});

/**
 * Fetch a new random quote from the backend
 */
async function fetchNewQuote() {
  try {
    showSpinner(true);
    newQuoteBtn.disabled = true;

    const response = await fetch(`${API_BASE_URL}/quote`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const { quote } = data;

    // Update UI with the quote
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;

    // Show success toast
    showToast('Quote saved to history!', 'success');

    // Update stats and history
    updateStats();
  } catch (error) {
    console.error('Error fetching quote:', error);
    showToast(`Failed to fetch quote: ${error.message}`, 'error');
  } finally {
    showSpinner(false);
    newQuoteBtn.disabled = false;
  }
}

/**
 * Toggle the history section visibility
 */
function toggleHistory() {
  historySection.classList.toggle('open');
  if (historySection.classList.contains('open')) {
    loadHistory();
  }
}

/**
 * Load and display quote history
 */
async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const { quotes } = data;

    // Clear previous history
    historyList.innerHTML = '';

    if (quotes.length === 0) {
      historyList.innerHTML = '<p class="empty-message">No quotes yet. Start by clicking "Get New Quote"!</p>';
      return;
    }

    // Display each quote
    quotes.forEach((quote) => {
      const historyItem = createHistoryItem(quote);
      historyList.appendChild(historyItem);
    });
  } catch (error) {
    console.error('Error loading history:', error);
    showToast(`Failed to load history: ${error.message}`, 'error');
  }
}

/**
 * Create a history item element
 */
function createHistoryItem(quote) {
  const item = document.createElement('div');
  item.className = 'history-item';

  const date = new Date(quote.savedAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  item.innerHTML = `
    <div class="history-item-text">"${quote.text}"</div>
    <div class="history-item-author">— ${quote.author}</div>
    <div class="history-item-date">${formattedDate}</div>
    <button class="history-item-delete" onclick="deleteQuote(${quote.id})">Delete</button>
  `;

  return item;
}

/**
 * Delete a quote from history
 */
async function deleteQuote(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/quote/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    showToast('Quote deleted successfully', 'success');
    loadHistory();
    updateStats();
  } catch (error) {
    console.error('Error deleting quote:', error);
    showToast(`Failed to delete quote: ${error.message}`, 'error');
  }
}

/**
 * Update statistics
 */
async function updateStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const { stats } = data;

    totalQuotesEl.textContent = stats.total || 0;
    uniqueAuthorsEl.textContent = stats.uniqueAuthors || 0;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

/**
 * Show/hide spinner
 */
function showSpinner(show) {
  if (show) {
    spinner.classList.add('active');
  } else {
    spinner.classList.remove('active');
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = 'toast show';

  if (type === 'error') {
    toast.classList.add('error');
  }

  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    fetchNewQuote();
  }
});
