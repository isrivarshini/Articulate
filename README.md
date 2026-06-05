# 🎤 Articulate

> An AI-powered speaking coach that helps you practice verbal communication with real-time speech analysis, gamification, and a friendly AI mascot — **Coach Vox**.

<img width="1432" height="701" alt="Screenshot 2026-05-14 at 6 59 16 PM" src="https://github.com/user-attachments/assets/b01ec46c-886c-492c-bd92-7a4fba117dd7" />

Articulate turns deliberate speaking practice into something you actually want to come back to. Pick a prompt, hit record, talk it out, and get meaningful, structured feedback on your fillers, pacing, vocabulary, and how well you stayed on topic — all wrapped in an XP-and-streaks progression system designed to keep you improving.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Core Systems](#core-systems)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

Articulate is a full-stack web application built for people who want to become more confident, clear, and compelling speakers. Whether you're prepping for a behavioral interview, sharpening a pitch, or just trying to cut down on "um" and "like," Articulate gives you a low-pressure space to practice and a feedback loop that actually tells you what to work on next.

The experience is anchored by **Coach Vox**, an AI mascot that guides you through sessions and frames feedback in an encouraging, human way. Under the hood, a custom NLP scoring engine and local speech-to-text transcription analyze every session, while a gamification layer (XP, levels, streaks, badges, leaderboards, and a skill tree) keeps the practice habit alive.

---

## Features

### 🎙️ Practice Sessions
- Record spoken responses to curated prompts directly in the browser.
- Local speech-to-text transcription powered by OpenAI Whisper.
- Minimum speech-length enforcement so feedback is based on enough signal to be meaningful.

### 📊 Speech Analysis
- **Filler-word detection** — surfaces "um," "uh," "like," "you know," and similar verbal crutches.
- **Lexical metrics** — vocabulary richness, word variety, and related readability signals.
- **Scoring engine** — a custom NLP pipeline that turns raw transcripts into actionable scores.
- **Topic-relevance scoring** *(in progress)* — a hybrid local + LLM approach that checks how well your answer actually addressed the prompt and gives specific, per-prompt feedback.
- **Noise & silence detection** *(in progress)* — warning flags for low-signal recordings.

### 🧩 Prompt System
A deep, categorized prompt library to keep practice fresh and targeted:
- **7 categories:** Random, General, Tech, Finance, One-Minute Pitch, Defend The Worst Take, and Explain To A 5-Year-Old.
- **3 difficulty levels** per category.
- **20 prompts each**, drawing from FAANG behavioral questions, system design, finance scenarios, and creative speaking formats.

### 🎡 The Spinner
A playful prompt-selection experience featuring a tornado animation and a slot-machine-style deceleration effect for picking your next challenge.

### 🏆 Gamification
- **XP & levels** that reward consistent practice.
- **Streaks** to build a daily habit.
- **Badges** for milestones and achievements.
- **Leaderboard** to compare progress with others.
- **Skill tree** that maps out a progression of speaking competencies.

### 🔐 Authentication
- Secure JWT-based authentication with bcrypt password hashing.

---

## Tech Stack

### Frontend
| Area | Choice |
|------|--------|
| Build tool | Vite |
| Framework | React (JavaScript + React Compiler) |
| Routing | React Router DOM v7 |
| Styling | Inline CSS with CSS custom properties |
| Typography | Pangolin (Google Font) |
| Design system | Four-color palette — lavender, mint, peach, sage |

### Backend
| Area | Choice |
|------|--------|
| Framework | FastAPI |
| Database | PostgreSQL |
| ORM | Async SQLAlchemy + asyncpg |
| Speech-to-text | OpenAI Whisper (running locally) |
| Auth | JWT + bcrypt |
| NLP | Custom scoring engine |
| Planned | Google Gemini Flash API (topic relevance + LLM feedback) |

---

## Architecture

Articulate runs as two cooperating services during development:

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   Frontend (Vite)        │         │   Backend (FastAPI)       │
│   http://localhost:5173  │ ──────► │   http://localhost:8000   │
│                          │  HTTP   │                           │
│   React + React Router   │  (JWT)  │   Async SQLAlchemy        │
└─────────────────────────┘         │   ├── Auth (JWT/bcrypt)    │
                                     │   ├── Sessions             │
                                     │   ├── Gamification engine  │
                                     │   ├── Whisper transcription│
                                     │   └── NLP scoring engine   │
                                     └────────────┬──────────────┘
                                                  │
                                          ┌───────▼────────┐
                                          │  PostgreSQL     │
                                          └────────────────┘
```

- The **frontend** handles the UI, recording flow, animations, and progression visuals; it talks to the backend over HTTP with a JWT for authenticated requests.
- The **backend** handles auth, session persistence, transcription, scoring, and all gamification logic.
- CORS is configured to allow the frontend origin (`http://localhost:5173`).

---

## Project Structure

```
Articulate/
├── frontend/          # Vite + React app
│   └── src/           # Canonical design system + components
├── backend/           # FastAPI application
└── README.md
```

> **Note:** Early in development there were two competing design systems — root-level `screen-*.jsx` files and the `src/` set. The **`src/` set is canonical**; the root-level screens are deprecated.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Python 3.11.9** (managed via [pyenv](https://github.com/pyenv/pyenv))
- **Node.js** (with npm) for the frontend
- **PostgreSQL** running locally
- **ffmpeg** — required by Whisper for audio processing
  ```bash
  # macOS
  brew install ffmpeg
  ```

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Articulate
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment (pyenv 3.11.9)
pyenv local 3.11.9
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

> **Dependency notes:**
> - `bcrypt` **must be pinned to `4.0.1`** to avoid a known incompatibility.
> - `greenlet` and `pydantic-settings` are required backend dependencies.

### 3. Database setup

Create the `articulate` database in PostgreSQL:

```bash
createdb articulate
```

On macOS, PostgreSQL typically uses **peer authentication**, so your `DATABASE_URL` should use your system username with no password (see [Environment Variables](#environment-variables)).

### 4. Frontend setup

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# macOS peer auth — use your system username, no password
DATABASE_URL=postgresql+asyncpg://srivarshiniinakollu@localhost:5432/articulate

# JWT
JWT_SECRET=<your-secret-key>

# Planned: topic relevance scoring + LLM feedback
GEMINI_API_KEY=<your-gemini-api-key>
```

> To enable the upcoming topic-relevance and AI-feedback features, create a **Gemini API key** at [aistudio.google.com](https://aistudio.google.com). Google Gemini Flash was chosen for its cost efficiency.

---

## Running the App

Run the backend and frontend in **two separate terminals**.

**Terminal 1 — Backend** (`http://localhost:8000`):
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 — Frontend** (`http://localhost:5173`):
```bash
cd frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Core Systems

### Speech Analysis Pipeline
1. Audio is recorded in the browser and sent to the backend.
2. **Whisper** transcribes the audio locally.
3. The **NLP scoring engine** analyzes the transcript for filler words, lexical metrics, and overall quality.
4. *(In progress)* A **hybrid local + LLM** layer scores topic relevance against the specific prompt and returns tailored feedback.
5. Results feed into the gamification system (XP, streaks, badges).

### Gamification Engine
Every completed session contributes XP, advances levels, maintains streaks, and can unlock badges. The leaderboard ranks users, and the skill tree provides a structured path of speaking competencies to work toward.

### Prompt Engine
Prompts are organized across 7 categories and 3 difficulty levels, with 20 prompts per category. The Spinner provides a fun, randomized way to land on your next prompt.

---

## Roadmap

- [ ] **Topic-relevance scoring** — hybrid local + LLM approach with specific per-prompt feedback (Gemini Flash).
- [ ] **Noise / silence detection** with warning flags on low-quality recordings.
- [ ] **Minimum 30-second speech enforcement** for more reliable scoring.
- [ ] LLM-generated, conversational feedback delivered through Coach Vox.

---

## Troubleshooting

**Port 8000 already in use**
```bash
lsof -ti:8000 | xargs kill -9
```

**`bcrypt` errors on login/signup** — ensure `bcrypt` is pinned:
```bash
pip install "bcrypt==4.0.1"
```

**Whisper fails on audio** — confirm `ffmpeg` is installed and on your PATH:
```bash
ffmpeg -version
```

**Database connection refused** — confirm PostgreSQL is running, the `articulate` database exists, and your `DATABASE_URL` uses your system username (macOS peer auth requires no password).

---

## License

_Add your license here (e.g., MIT)._

---

<p align="center">Built with 🎤 and ☕ — practice out loud, get better every day.</p>
