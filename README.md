# 🧠 MindSpace — Cognitive Load Manager

> *Treat your time and attention like a financial budget.*

MindSpace is a full-stack MERN application that reframes productivity around **mental energy** rather than simple task lists. Every task carries a cognitive cost. Every break is a recovery investment. Your mind has a budget — MindSpace helps you spend it wisely.

---

## ✦ Feature Overview

| Feature | Description |
|---|---|
| **Energy Budget** | Daily mental energy pool (100 units) that depletes as tasks are completed |
| **Cognitive Load Scoring** | Each task rated 1–100 for mental cost with auto-detection from keywords |
| **Smart Scheduling** | Algorithm orders tasks by load × priority × brain state multiplier |
| **Brain State System** | 5 states (Sharp → Exhausted) that multiply your effective capacity |
| **Context Switch Penalty** | Switching energy types adds 8–15% cognitive overhead |
| **Cognitive Debt** | Deferred tasks accumulate "debt" that reduces tomorrow's budget |
| **Adaptive Pomodoro** | Focus sessions auto-adjust length based on task load & brain state |
| **Energy Recovery** | Timed breaks restore energy with diminishing-returns scaling |
| **Analytics Dashboard** | Weekly energy trends, type breakdowns, priority completion rates |
| **Ambient Sound** | Web Audio API white noise for focus sessions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install server deps
cd mindspace/server
cp .env.example .env      # edit MONGODB_URI and JWT_SECRET
npm install

# Install client deps
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:

```
MONGODB_URI=mongodb://localhost:27017/mindspace
JWT_SECRET=change_this_to_a_long_random_string
PORT=5001
CLIENT_URL=http://localhost:5173
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — React frontend
cd client && npm run dev
```

Then open **http://localhost:5173**

---

## 🏗 Architecture

```
mindspace/
├── server/                     # Express + MongoDB backend
│   ├── server.js               # Entry point, middleware, routes
│   ├── models/
│   │   ├── User.js             # Energy profile, brain state, cognitive debt
│   │   ├── Task.js             # Cognitive load, energy type, defer system
│   │   └── EnergyLog.js        # Daily energy tracking & performance scores
│   ├── middleware/
│   │   └── auth.js             # JWT verification + daily energy reset
│   └── routes/
│       ├── auth.js             # Register, login, /me, brain-state
│       ├── tasks.js            # CRUD + complete/defer/start with engine
│       ├── energy.js           # Recovery, budget config
│       └── analytics.js        # Overview stats, trends, insights
│
└── client/                     # Vite + React 18 frontend
    └── src/
        ├── App.jsx             # Router, layout, toast system
        ├── index.css           # Full design system (tokens, animations)
        ├── api/client.js       # Axios + JWT interceptors
        ├── context/
        │   └── MindSpaceContext.jsx  # Global state (useReducer)
        └── components/
            ├── Auth/AuthScreen.jsx          # Neural canvas + login/register
            ├── Layout/Sidebar.jsx           # Nav, energy bar, brain picker, breaks
            ├── Dashboard/
            │   ├── Dashboard.jsx            # Main overview
            │   ├── EnergyGauge.jsx          # SVG circular gauge
            │   └── (BrainStateSelector)     # Embedded in sidebar
            ├── Tasks/
            │   ├── TaskManager.jsx          # Full task list, filters, sorts
            │   ├── TaskCard.jsx             # Load bar, type icon, actions
            │   └── AddTaskModal.jsx         # 4-step creation wizard
            ├── FocusMode/FocusMode.jsx      # Fullscreen adaptive timer
            └── Analytics/Analytics.jsx      # Charts (recharts) + insights
```

---

## 🧮 Cognitive Load Engine

### Scheduling Algorithm (server/routes/tasks.js)

Tasks are scored and ordered by:

```
score = cognitiveLoad × priorityWeight × brainStateMultiplier
```

Brain state multipliers:
- ⚡ Sharp     → 1.20×
- 🎯 Focused   → 1.05×
- 🧠 Normal    → 1.00×
- 😑 Tired     → 0.75×
- 💀 Exhausted → 0.50×

### Context Switch Penalty

Switching between incompatible energy types adds overhead:

| Switch | Penalty |
|---|---|
| Deep Work ↔ Social | +15 units |
| Creative ↔ Admin   | +15 units |
| Any other switch   | +8 units  |

### Cognitive Debt

Each task deferral generates debt: `load × 0.15 × deferCount`

Debt accumulates on the user and is subtracted from tomorrow's budget (capped at 20 units penalty). Debt recovers 5 units/day naturally, or faster with long breaks.

### Adaptive Pomodoro (FocusMode)

| Cognitive Load | Focus Session | Break |
|---|---|---|
| 70–100 | 25 min × brain adj. | 10 min |
| 40–69  | 35 min × brain adj. | 7 min  |
| 1–39   | 45 min × brain adj. | 5 min  |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#04040D` (void black) |
| Surface | `#0C0C22` |
| Primary Accent | `#3DFF8F` (phosphor green) |
| Secondary | `#00D4FF` (electric cyan) |
| Warning | `#FFB443` (amber) |
| Danger | `#FF4B6E` (neon red) |
| Display Font | Syne (800) |
| Body Font | Outfit |
| Data Font | JetBrains Mono |

---

## 📡 API Reference

### Auth
```
POST   /api/auth/register      { name, email, password }
POST   /api/auth/login         { email, password }
GET    /api/auth/me            → user profile
PATCH  /api/auth/brain-state   { brainState }
```

### Tasks
```
GET    /api/tasks              ?status= &energyType= &sort=smart
POST   /api/tasks              { title, cognitiveLoad, energyType, estimatedDuration, ... }
PATCH  /api/tasks/:id          (partial update)
POST   /api/tasks/:id/start    → sets in_progress
POST   /api/tasks/:id/complete { actualDuration }
POST   /api/tasks/:id/defer    → increments debt
DELETE /api/tasks/:id
```

### Energy
```
GET    /api/energy             → current energy state
POST   /api/energy/recover     { minutes }
PATCH  /api/energy/budget      { dailyBudget, recoveryRate, peakHour }
```

### Analytics
```
GET    /api/analytics/overview ?days=7|14|30
```

---

## 🔮 Extending MindSpace

Ideas for next features:
- **AI Load Prediction** — Use Claude API to estimate cognitive cost from task descriptions
- **Calendar Integration** — Sync with Google Calendar to block off focus time
- **Team Mode** — Share cognitive load visibility with a team
- **Wearable Sync** — Import HRV/sleep data for automated brain state detection
- **Weekly Review** — Auto-generated Sunday retrospectives

---

*Built with the MERN stack. Designed for humans.*
