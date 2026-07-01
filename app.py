import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from flask import Flask, g, jsonify, render_template


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "quotes.db"

QUOTE_APIS = (
    {
        "url": "https://api.quotable.io/random",
        "quote_key": "content",
        "author_key": "author",
    },
    {
        "url": "https://dummyjson.com/quotes/random",
        "quote_key": "quote",
        "author_key": "author",
    },
)


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(DATABASE=DATABASE_PATH)

    if test_config:
        app.config.update(test_config)

    @app.teardown_appcontext
    def close_db(error=None):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    with app.app_context():
        init_db()

    @app.get("/")
    def index():
        return render_template("index.html", history=get_quote_history())

    @app.get("/api/quote")
    def random_quote():
        try:
            quote = fetch_random_quote()
        except QuoteFetchError as exc:
            return jsonify({"error": str(exc)}), 502

        saved_quote = save_quote(quote["text"], quote["author"], quote["source"])
        return jsonify(saved_quote)

    @app.get("/api/history")
    def quote_history():
        return jsonify(get_quote_history())

    return app


class QuoteFetchError(RuntimeError):
    pass


def get_db():
    if "db" not in g:
        db_path = app_config_database()
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db


def app_config_database():
    from flask import current_app

    return current_app.config["DATABASE"]


def init_db():
    db = get_db()
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            author TEXT NOT NULL,
            source TEXT NOT NULL,
            fetched_at TEXT NOT NULL
        )
        """
    )
    db.commit()


def fetch_random_quote(timeout=8):
    errors = []

    for api in QUOTE_APIS:
        request = Request(
            api["url"],
            headers={"Accept": "application/json", "User-Agent": "quotes-history-app/1.0"},
        )

        try:
            with urlopen(request, timeout=timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            errors.append(f"{api['url']}: {exc}")
            continue

        text = str(payload.get(api["quote_key"], "")).strip()
        author = str(payload.get(api["author_key"], "")).strip() or "Unknown"

        if text:
            return {"text": text, "author": author, "source": api["url"]}

        errors.append(f"{api['url']}: response did not include a quote")

    detail = "; ".join(errors) if errors else "no quote APIs configured"
    raise QuoteFetchError(f"Could not fetch a quote from the external API. {detail}")


def save_quote(text, author, source):
    fetched_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO quotes (text, author, source, fetched_at)
        VALUES (?, ?, ?, ?)
        """,
        (text, author, source, fetched_at),
    )
    db.commit()

    return {
        "id": cursor.lastrowid,
        "text": text,
        "author": author,
        "source": source,
        "fetched_at": fetched_at,
    }


def get_quote_history(limit=20):
    rows = get_db().execute(
        """
        SELECT id, text, author, source, fetched_at
        FROM quotes
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    return [dict(row) for row in rows.fetchall()]


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=True)
