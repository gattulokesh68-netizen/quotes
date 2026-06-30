const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'quotes.db');
let db;

/**
 * Initialize the SQLite database
 */
function initializeDatabase() {
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('✅ Connected to SQLite database');
      createTables();
    }
  });
}

/**
 * Create necessary tables if they don't exist
 */
function createTables() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        source TEXT DEFAULT 'quotable.io',
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating quotes table:', err);
      } else {
        console.log('✅ Quotes table ready');
      }
    });
  });
}

/**
 * Save a quote to the database
 * @param {string} text - Quote text
 * @param {string} author - Quote author
 * @param {string} source - Quote source (default: quotable.io)
 * @returns {Promise<object>} - Saved quote with ID
 */
function saveQuote(text, author, source = 'quotable.io') {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO quotes (text, author, source) VALUES (?, ?, ?)';
    db.run(sql, [text, author, source], function (err) {
      if (err) {
        console.error('Error saving quote:', err);
        reject(err);
      } else {
        const id = this.lastID;
        resolve({
          id,
          text,
          author,
          source,
          savedAt: new Date().toISOString()
        });
      }
    });
  });
}

/**
 * Get all quotes from the database
 * @returns {Promise<Array>} - Array of quotes
 */
function getAllQuotes() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, text, author, source, saved_at as savedAt FROM quotes ORDER BY saved_at DESC';
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('Error retrieving quotes:', err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Get a quote by ID
 * @param {number} id - Quote ID
 * @returns {Promise<object>} - Quote object
 */
function getQuoteById(id) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, text, author, source, saved_at as savedAt FROM quotes WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error('Error retrieving quote:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Delete a quote from the database
 * @param {number} id - Quote ID
 * @returns {Promise<boolean>} - Success status
 */
function deleteQuote(id) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM quotes WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        console.error('Error deleting quote:', err);
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Get statistics about quotes
 * @returns {Promise<object>} - Statistics
 */
function getStatistics() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(*) as total, COUNT(DISTINCT author) as uniqueAuthors FROM quotes';
    db.get(sql, (err, row) => {
      if (err) {
        console.error('Error retrieving statistics:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  saveQuote,
  getAllQuotes,
  getQuoteById,
  deleteQuote,
  getStatistics
};