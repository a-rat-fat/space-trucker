# 🚛🚀 Space Truckers — Mini Simulation Game

A small, fun, turn-based web game where you manage a fleet of interstellar trucks.
Balance **fuel**, **time**, **maintenance**, and **profit** while taking delivery contracts between planets.

Deployed easily on **Railway** via Docker or locally with **OrbStack** / Docker Desktop.

---

## ✨ Features

- Turn-based gameplay (Day/Night cycle)
- Fleet management: buy/sell ships, refuel, repair
- Contracts with distance, weight, deadline, and payout
- Random events: breakdowns, fuel price changes, inspections
- Leaderboard endpoint (in-memory) to submit your best profit
- Clean, responsive UI (Tailwind via CDN) + dark theme

---

## 🧱 Stack

- **Backend**: Python 3 + Flask
- **Frontend**: Vanilla JS, Tailwind (CDN), a sprinkle of CSS
- **Packaging**: Dockerfile for Railway / OrbStack

---

## ▶️ Run locally (OrbStack / Docker)

```bash
# 1) Build image
docker build -t space-truckers .

# 2) Run container
docker run -p 8080:8080 --env PORT=8080 space-truckers

# Open http://localhost:8080
```

If you're using OrbStack on macOS, the above commands work as-is.

---

## ☁️ Deploy on Railway

1. Create a new project on Railway using your Git repo or upload directly.
2. Ensure Railway uses the provided `Dockerfile`.
3. Add an environment variable `PORT=8080` (Railway usually injects one automatically).
4. Deploy — the app listens on `$PORT`.

---

## 🔧 Environment

Copy `.env.example` to `.env` if running locally and want to override defaults.

---

## 📡 API

- `POST /api/score` — Submit `{ "name": "Marko", "profit": 12345 }`
- `GET /api/leaderboard` — Returns top scores (in-memory, resets on restart)

---

## 📁 Project Structure

```
space-truckers/
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

MIT — Do whatever you want. Have fun and credit if you feel like it.
