# TOEFL iBT Prep — Web Application

A static web app for practicing all four TOEFL iBT sections, hosted on GitHub Pages. Reading and Listening use a bundled question bank; Speaking and Writing are evaluated by a locally-running Gemma 4 model via Ollama.

---

## Status

| Item | Status |
|------|--------|
| Vite + React scaffold | ✅ Done |
| Tailwind CSS (v4) | ✅ Done |
| React Router (HashRouter for GitHub Pages) | ✅ Done |
| GitHub Actions deploy workflow | ✅ Done |
| Reading question bank (5 passages × 10 MCQ) | ✅ Done |
| Listening question bank (5 transcripts × 5–6 MCQ) | ✅ Done |
| Speaking prompt bank (20 prompts) | ✅ Done |
| Writing prompt bank (15 prompts — 10 independent + 5 integrated) | ✅ Done |
| Ollama service (health check, speaking eval, writing eval) | ✅ Done |
| Progress tracking via localStorage (no-repeat logic) | ✅ Done |
| Dashboard with per-section progress bars | ✅ Done |
| Reading section UI | ✅ Done |
| Listening section UI (collapsible transcript) | ✅ Done |
| Speaking section UI + Gemma 4 evaluation | ✅ Done |
| Writing section UI + Gemma 4 evaluation | ✅ Done |
| Ollama setup banner (shown when offline) | ✅ Done |
| Production build verified (`npm run build`) | ✅ Done |
| Deployed to GitHub Pages | ⬜ Pending |

---

## Architecture

```
Browser (GitHub Pages)
│
├── React app (Vite, HashRouter)
│   ├── Reading / Listening  →  bundled JSON question bank
│   └── Speaking / Writing   →  fetch() to localhost:11434
│
└── Ollama (runs on user's laptop)
    └── gemma4:e4b  (9.6 GB, ~12 GB RAM required)
```

**Key decisions:**
- **Static site only** — no backend, no server. GitHub Pages hosts HTML/CSS/JS.
- **HashRouter** — avoids 404s on direct URL access (GitHub Pages does not support HTML5 history routing).
- **Ollama local API** — Speaking/Writing evaluation is done entirely on the user's machine. No data leaves the laptop.
- **Listening (Phase 1)** — text transcript mode (no audio files). Audio support is Phase 2.
- **Progress in localStorage** — questions are never repeated within a section until all have been seen, then the cycle resets automatically.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Routing | React Router v7 (HashRouter) |
| LLM engine | Ollama (`http://localhost:11434`) |
| LLM model | `gemma4:e4b` — 9.6 GB, effective 4B params |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (`peaceiris/actions-gh-pages`) |
| State persistence | `localStorage` (no external DB) |

---

## Project Structure

```
toefl/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Build → push dist/ to gh-pages branch
├── src/
│   ├── data/
│   │   ├── reading.json        # 5 academic passages, 10 MCQ each (50 questions)
│   │   ├── listening.json      # 5 transcripts (3 lectures + 2 conversations), 5–6 MCQ each
│   │   ├── speaking.json       # 20 independent speaking prompts
│   │   └── writing.json        # 15 writing prompts (10 independent, 5 integrated)
│   ├── services/
│   │   └── ollamaService.js    # Ollama API: health check, evaluateSpeaking, evaluateWriting
│   ├── hooks/
│   │   ├── useProgress.js      # localStorage progress, getNextItem, markComplete, getStats
│   │   └── useOllama.js        # Ollama connection status (checking / online / offline)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── OllamaSetup.jsx     # Setup instructions banner (shown when Ollama is offline)
│   │   ├── Dashboard/
│   │   ├── Reading/
│   │   ├── Listening/
│   │   ├── Speaking/
│   │   └── Writing/
│   ├── App.jsx                 # HashRouter + Routes
│   ├── main.jsx
│   └── index.css               # Tailwind v4 import
├── vite.config.js              # base: '/toefl/' — must match GitHub repo name
└── package.json
```

---

## TOEFL iBT Sections Covered

| Section | Format | Time | Questions |
|---------|--------|------|-----------|
| **Reading** | 3–5 academic passages, 10 MCQ per passage | 35 min | 20 per test |
| **Listening** | Lectures + conversations (text transcripts in Phase 1) | 36 min | 28 per test |
| **Speaking** | 1 independent task (typed response, AI-scored) | 16 min | 4 tasks per test |
| **Writing** | 1 integrated + 1 independent task (AI-scored) | 29 min | 2 tasks per test |

### Scoring rubrics used by Gemma 4

**Speaking (0–4 scale)**
- Delivery — clarity, fluency, pace
- Language Use — grammar, vocabulary
- Topic Development — relevance, completeness, coherence

**Writing (0–5 scale)**
- Task Achievement
- Coherence & Organization
- Language Use

---

## Running Locally

```bash
# 1. Install dependencies (already done)
npm install

# 2. Start the dev server
cd /path/to/toefl
npm run dev
# → http://localhost:5173/toefl/

# 3. (Optional) Enable AI evaluation for Speaking + Writing
OLLAMA_ORIGINS="*" ollama serve     # in a separate terminal
ollama pull gemma4:e4b              # one-time download (~9.6 GB)
```

Reading and Listening work fully offline. Speaking and Writing require Ollama running.

---

## Deploying to GitHub Pages

1. Create a GitHub repository (e.g. `toefl`).
2. Confirm `base` in `vite.config.js` matches the repo name:
   ```js
   base: '/toefl/',
   ```
3. Push the `main` branch. GitHub Actions (`.github/workflows/deploy.yml`) will:
   - Run `npm ci && npm run build`
   - Push `dist/` to the `gh-pages` branch
4. In the repo **Settings → Pages**, set source to the `gh-pages` branch.
5. App will be live at `https://<your-username>.github.io/toefl/`.

---

## Roadmap

### Phase 1 — Complete ✅
- All four TOEFL sections practised in a single app
- 50 reading MCQ + 28 listening MCQ + 20 speaking prompts + 15 writing prompts
- AI evaluation for Speaking and Writing (Gemma 4 via Ollama)
- No-repeat question logic with localStorage
- GitHub Pages deployment pipeline

### Phase 2 — Planned
- [ ] **Expand question bank** — integrate [TOEFL-QA dataset](https://github.com/iamyuanchung/TOEFL-QA) (963 listening questions) and [HuggingFace speaking dataset](https://huggingface.co/datasets/HCHSmost/toefl_speaking)
- [ ] **LLM question generation** — use Gemma 4 to generate new reading passages + questions when the bank runs low
- [ ] **Wrong-answer explanations** — Gemma 4 explains why each Reading/Listening answer is correct
- [ ] **Real audio for Listening** — browser `<audio>` playback using TOEFL-QA audio files or TTS
- [ ] **Speech recognition for Speaking** — browser `SpeechRecognition` API → transcript → Gemma evaluation
- [ ] **Full mock test mode** — timed simulation of all 4 sections with a final 0–120 score report
- [ ] **Score report export** — PDF download of session results

---

## Question Bank Sources

| Section | Source | Notes |
|---------|--------|-------|
| Reading | Hand-crafted TOEFL-style academic passages | Horse domestication, thermohaline circulation, printing press, symbiosis, ancient cities |
| Listening | Hand-crafted transcripts | Lectures: cellular respiration, Silk Road, ocean acidification · Conversations: thesis advising, library databases |
| Speaking | Hand-crafted, based on official TOEFL prompt patterns | 20 independent prompts |
| Writing | Hand-crafted, based on official ETS prompt pool | 10 independent + 5 integrated (each with mini reading passage + lecture transcript) |

Phase 2 will supplement these with the TOEFL-QA GitHub dataset and HuggingFace datasets.
