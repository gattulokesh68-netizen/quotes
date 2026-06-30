# Quotes Application

A full-stack application that fetches random quotes from an external API and saves them to a database for history tracking.

## Features

- 🎲 Fetch random quotes from an external API
- 💾 Save quotes to a database for history tracking
- 🎨 Beautiful user interface to display quotes
- 📊 View quote history
- 🔄 Real-time quote updates

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** for database storage
- **Axios** for API requests

### Frontend
- **HTML5** & **CSS3**
- **Vanilla JavaScript**
- **Fetch API** for backend communication

## Project Structure

```
quotes/
├── backend/
│   ├── server.js           # Express server
│   ├── database.js         # Database setup and queries
│   ├── quoteService.js     # Quote API integration
│   ├── routes.js           # API endpoints
│   ├── package.json        # Dependencies
│   └── quotes.db           # SQLite database (generated)
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── css/
│   │   └── style.css       # Application styles
│   └── js/
│       └── app.js          # Frontend logic
└── README.md               # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Backend

```bash
cd backend
npm install
node server.js
```

The backend will start on `http://localhost:3000`

### Setup Frontend

```bash
cd frontend
# Open index.html in your browser
# Or use a local server:
npx http-server
```

## API Endpoints

### Get a Random Quote
```
GET /api/quote
```
Fetches a random quote from the external API and saves it to the database.

**Response:**
```json
{
  "id": 1,
  "text": "Innovation distinguishes between a leader and a follower.",
  "author": "Steve Jobs",
  "savedAt": "2024-01-15T10:30:00Z"
}
```

### Get Quote History
```
GET /api/history
```
Retrieves all saved quotes from the database.

**Response:**
```json
[
  {
    "id": 1,
    "text": "Innovation distinguishes between a leader and a follower.",
    "author": "Steve Jobs",
    "savedAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

### Delete Quote from History
```
DELETE /api/quote/:id
```
Removes a quote from the history.

**Response:**
```json
{
  "message": "Quote deleted successfully",
  "id": 1
}
```

## External API Used

- **Quotable API** (https://api.quotable.io/random)
  - Free to use
  - No API key required
  - Returns random quotes with author information

## Usage

1. Start the backend server
2. Open the frontend in your browser
3. Click "Get New Quote" to fetch and save a random quote
4. View your quote history in the history section
5. Click "Delete" to remove a quote from history

## Learning Outcomes

- ✅ API integration with external services
- ✅ Database CRUD operations
- ✅ Backend REST API development
- ✅ Frontend-backend communication
- ✅ Error handling and edge cases
- ✅ Data persistence and retrieval

## Future Enhancements

- [ ] User authentication
- [ ] Favorite quotes functionality
- [ ] Quote filtering and search
- [ ] Export quotes to PDF
- [ ] Multiple quote source APIs
- [ ] Rate limiting

## License

MIT License - feel free to use this project for learning purposes.