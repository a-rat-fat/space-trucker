# 🚛🚀 Space Truckers v2 — Persistent Mini Sim (Flask + SQLite)

Space Truckers v2 is a turn-based web mini-sim where you manage a fleet of interstellar trucks.
This version adds **SQLite persistence**, **advanced random events**, and an **improved UI**.

---

## ✨ What's new in v2

- **Persistence (SQLite)** for Leaderboard and Game Saves (3 slots).
- **Advanced Events**: pirates, solar storms, engine overheat, tax/random grants, fuel spikes.
- **UI Enhancements**: smoother feedback, new controls, save/load panel, light polish.
- **API**:
  - `POST /api/score` → `{ name, profit }` saves a score
  - `GET /api/leaderboard` → top 20 scores
  - `POST /api/save` → `{ slot, state }` saves the current game state (JSON)
  - `GET /api/save?slot=1` → returns `{ state }` for the slot or `{}` if empty

---

## 🧱 Stack

- **Backend**: Python 3 + Flask (Gunicorn in Docker)
- **DB**: SQLite (file path configurable via `DB_PATH`, default `/data/game.db`)
- **Frontend**: Vanilla JS + Tailwind (CDN)

---

## ▶️ Run locally (OrbStack / Docker)

```bash
unzip space-truckers-v2.zip
cd space-truckers-v2

# Build image
docker build -t space-truckers-v2 .

# Create a local data directory for persistence
mkdir -p data

# Run (maps ./data to /data in the container for SQLite persistence)
docker run -p 8080:8080 --env PORT=8080 -v $(pwd)/data:/data space-truckers-v2

# Open http://localhost:8080
```

> Tip (macOS/OrbStack): the commands above work out of the box.

---

## ☁️ Deploy on Railway

1) Push this project to a Git repo or upload the folder.  
2) Create a new Railway service from the repo.  
3) Ensure Railway uses the **Dockerfile**.  
4) Railway sets `$PORT` automatically; keep `CMD` as provided.  
5) Storage on Railway containers is ephemeral; for real persistence, use a volume or hosted DB.

Environment variables (optional):
- `PORT=8080`
- `DB_PATH=/data/game.db`

---

## 📁 Structure

```
space-truckers-v2/
├─ app/
│  ├─ app.py
│  ├─ templates/
│  │  └─ index.html
│  └─ static/
│     └─ js/
│        └─ game.js
├─ Dockerfile
├─ requirements.txt
├─ .env.example
└─ README.md
```

---

## 📝 License

MIT — Have fun! Credit appreciated.
