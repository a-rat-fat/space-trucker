import os
import time
from flask import Flask, render_template, jsonify, request, send_from_directory

app = Flask(__name__, static_folder="static", template_folder="templates")

# In-memory leaderboard (resets on restart)
LEADERBOARD = []

@app.route("/")
def index():
    return render_template("index.html")

@app.post("/api/score")
def post_score():
    data = request.get_json(force=True, silent=True) or {}
    name = str(data.get("name", "Anonymous")).strip()[:24] or "Anonymous"
    profit = int(data.get("profit", 0))
    timestamp = int(time.time())
    LEADERBOARD.append({"name": name, "profit": profit, "ts": timestamp})
    # Keep top 20
    LEADERBOARD.sort(key=lambda x: x["profit"], reverse=True)
    del LEADERBOARD[20:]
    return jsonify({"ok": True, "leaderboard": LEADERBOARD})

@app.get("/api/leaderboard")
def get_leaderboard():
    return jsonify(LEADERBOARD)

# Health check
@app.get("/healthz")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
