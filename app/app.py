import os
import json
import time
import sqlite3
from pathlib import Path
from flask import Flask, render_template, jsonify, request

# Config
DB_PATH = os.environ.get("DB_PATH", "/data/game.db")
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    con = get_db()
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            profit INTEGER NOT NULL,
            ts INTEGER NOT NULL
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_scores_profit ON scores(profit DESC)")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slot INTEGER NOT NULL UNIQUE,
            state TEXT NOT NULL,
            ts INTEGER NOT NULL
        )
    """)
    con.commit()
    con.close()

init_db()

app = Flask(__name__, static_folder="static", template_folder="templates")

@app.route("/")
def index():
    return render_template("index.html")

# Leaderboard — persistent
@app.post("/api/score")
def post_score():
    data = request.get_json(force=True, silent=True) or {}
    name = (str(data.get("name", "Anonymous")).strip() or "Anonymous")[:24]
    profit = int(data.get("profit", 0))
    ts = int(time.time())
    with get_db() as con:
        con.execute("INSERT INTO scores(name, profit, ts) VALUES (?, ?, ?)", (name, profit, ts))
        rows = con.execute("SELECT name, profit, ts FROM scores ORDER BY profit DESC, ts ASC LIMIT 20").fetchall()
    lb = [dict(r) for r in rows]
    return jsonify({"ok": True, "leaderboard": lb})

@app.get("/api/leaderboard")
def get_leaderboard():
    with get_db() as con:
        rows = con.execute("SELECT name, profit, ts FROM scores ORDER BY profit DESC, ts ASC LIMIT 20").fetchall()
    return jsonify([dict(r) for r in rows])

# Saves — persistent
@app.post("/api/save")
def save_state():
    data = request.get_json(force=True, silent=True) or {}
    slot = int(data.get("slot", 1))
    state = data.get("state") or {}
    # Validate slot range 1..3
    slot = max(1, min(3, slot))
    ts = int(time.time())
    payload = json.dumps(state, separators=(",", ":"))
    with get_db() as con:
        # Upsert by unique slot
        con.execute("INSERT INTO saves(slot, state, ts) VALUES (?, ?, ?) ON CONFLICT(slot) DO UPDATE SET state=excluded.state, ts=excluded.ts", (slot, payload, ts))
        rows = con.execute("SELECT slot, state, ts FROM saves ORDER BY slot ASC").fetchall()
    out = [{"slot": r["slot"], "ts": r["ts"]} for r in rows]
    return jsonify({"ok": True, "slots": out})

@app.get("/api/save")
def load_state():
    try:
        slot = int(request.args.get("slot", "1"))
    except ValueError:
        slot = 1
    slot = max(1, min(3, slot))
    with get_db() as con:
        row = con.execute("SELECT state, ts FROM saves WHERE slot = ?", (slot,)).fetchone()
    if not row:
        return jsonify({})
    return jsonify({"state": json.loads(row["state"]), "ts": row["ts"]})

@app.get("/healthz")
def health():
    # Simple DB ping
    try:
        with get_db() as con:
            con.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}, 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
