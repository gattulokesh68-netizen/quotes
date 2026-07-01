# Quote History App

A small Flask application that fetches random quotes from an external API, displays them in the browser, and saves every fetched quote to a SQLite history database.

## Run

```powershell
python app.py
```

Then open `http://127.0.0.1:5000`.

## Test

```powershell
python -m unittest discover -s tests
```

The app uses `https://api.quotable.io/random` first and falls back to `https://dummyjson.com/quotes/random` if the first API is unavailable.
