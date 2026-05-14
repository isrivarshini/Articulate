# Articulate Backend

FastAPI backend for Articulate — a speaking and verbal articulation improvement app.

## Tech Stack

- **Framework**: FastAPI (async)
- **Database**: PostgreSQL + SQLAlchemy (async)
- **Speech Recognition**: OpenAI Whisper (local)
- **Auth**: JWT + bcrypt

## Setup

### 1. Prerequisites

- Python 3.11+
- PostgreSQL running locally
- ffmpeg (required by Whisper for audio processing)

```bash
# macOS
brew install ffmpeg postgresql

# Ubuntu
sudo apt install ffmpeg postgresql
```

### 2. Create the database

```bash
createdb articulate
```

### 3. Set up the environment

```bash
cd articulate-backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 5. Seed the database

```bash
python -m app.seed
```

### 6. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.
Auto-generated docs at `http://localhost:8000/docs`.

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Get JWT token
- `GET  /api/auth/me` — Get current user

### Practice
- `POST /api/practice/analyze` — Upload audio, get analysis
- `GET  /api/practice/sessions` — List past sessions
- `GET  /api/practice/sessions/{id}` — Session detail

### Prompts
- `GET  /api/prompts/{mode}?context=Technical` — Get prompts
- `GET  /api/prompts/{mode}/random?context=Technical` — Random prompt

### Social
- `GET  /api/leaderboard` — Weekly rankings
- `GET  /api/stats` — Your stats
- `GET  /api/badges` — Badge list with earned status

## Whisper Models

Set `WHISPER_MODEL` in `.env`. Options (speed vs accuracy tradeoff):

| Model  | Size   | Speed   | Accuracy |
|--------|--------|---------|----------|
| tiny   | 39 MB  | Fastest | Lowest   |
| base   | 74 MB  | Fast    | Good     |
| small  | 244 MB | Medium  | Better   |
| medium | 769 MB | Slow    | Great    |
| large  | 1.55 GB| Slowest | Best     |

Start with `base` for development, upgrade to `small` or `medium` for production.