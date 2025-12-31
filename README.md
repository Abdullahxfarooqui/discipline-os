# Discipline OS

A production-ready web platform that enforces discipline through structured accountability, measurable performance, intelligent leniency, and unavoidable consequences.

## Philosophy

> "Discipline OS is your personal operating system for daily compliance across deen, health, productivity, mental control, and accountability circles for couples."

**Core Principles:**
- Discipline over comfort
- Consistency over intensity
- Accountability over excuses
- Progress over perfection
- Truth over feelings

## Features

### 🎯 Daily Task Management
- 29 tasks across 8 categories (Deen, Health, Sleep, Nutrition, Productivity, Mental, Digital, Deen Upgrades)
- Weighted scoring system (185 total points)
- Mandatory vs optional task distinction
- Time-sensitive completions (Fajr by deadline, sleep windows)

### 📊 Scoring System
- **Safe Zone**: 65%+ completion = green day
- **Warning Zone**: 50-64% = yellow day (2-day grace)
- **Failure Zone**: Below 50% = red day (immediate penalty)

### ⚡ Penalty Engine
8 penalty types across 2 severity levels:
- **Minor**: Extra cardio, cold shower, entertainment restriction, social media lockout
- **Major**: Full entertainment ban, extra workout, charity donation, earlier wake-up

### 🔥 Streak System
Milestones at 3, 7, 14, 21, 30, 60, 90, 180, and 365 days with:
- XP bonuses
- Badge rewards
- Unlock privileges

### 💑 Couples Accountability
- Create/join accountability circles
- View partner's daily progress
- Assign penalties to each other
- Shared streaks and challenges

### 📈 Analytics
- Weekly/monthly performance tracking
- Activity heatmaps
- Category breakdowns
- Trend analysis

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Realtime DB)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Copy your config to `.env.local`
5. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── analytics/         # Analytics page
│   ├── couples/           # Couples circle page
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Login page
│   ├── settings/          # Settings page
│   ├── signup/            # Signup page
│   └── tasks/             # Task management
├── components/
│   ├── dashboard/         # Dashboard widgets
│   ├── layout/            # Navigation, AuthProvider
│   ├── tasks/             # Task list components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── engines/           # Core logic
│   │   ├── analyticsEngine.ts
│   │   ├── penaltyEngine.ts
│   │   ├── scoringEngine.ts
│   │   ├── streakEngine.ts
│   │   └── taskEngine.ts
│   ├── firebase/          # Firebase config & services
│   └── utils.ts           # Utility functions
├── store/
│   └── appStore.ts        # Zustand global store
└── types/
    └── index.ts           # TypeScript interfaces
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## Task Categories

| Category | Tasks | Focus |
|----------|-------|-------|
| 🕌 Deen | 5 prayers | Spiritual foundation |
| 💪 Health | Workout, steps, mobility | Physical strength |
| 😴 Sleep | Sleep time, wake time | Recovery |
| 🥗 Nutrition | Calories, water, junk food | Fuel |
| ⚡ Productivity | Deep work, learning | Output |
| 🧠 Mental | Mood check, gratitude | Mindset |
| 📱 Digital | Screen time limits | Focus |
| 📖 Deen Upgrade | Quran, dhikr, charity | Growth |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

---

**Remember**: Discipline is not punishment. It's training for the life you want.
