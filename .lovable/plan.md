
# Screen Time Monitor — Web App (Phase 1)

A beautifully designed, fully navigable screen time monitoring web app built with React, TypeScript, Tailwind CSS, and Recharts. All data is mock — ready for real backend integration in Phase 2.

---

## 1. Foundation: Types, Theme & Utilities
- Define all TypeScript types: `AppUsageData`, `UsageData`, `DailySummary`, `AppLimit`, `Exercise`, `ExerciseSession`, etc.
- Set up a custom color palette (blues, greens, status colors) via Tailwind CSS variables
- Build utility functions: `formatTime`, `formatPercentage`, `formatNumber`, date helpers (`getLast7Days`, `getRelativeDateLabel`, etc.)
- Define constants: default limits, cooldowns, max extensions, mock app icons (emoji-based)

## 2. Mock Data Service
- `MockDataService` providing realistic screen time data for 5+ apps (Instagram, YouTube, Twitter, Slack, Netflix)
- Daily usage with randomized but realistic numbers
- 7-day and 30-day historical data generation
- Refresh function that simulates live data updates
- `ExerciseService` with 5 pre-defined exercises across easy/medium/hard difficulties

## 3. State Management (Zustand)
- **Usage Store**: today's screen time, app list, daily limit, limit-exceeded flag, weekly data, loading states
- **Settings Store**: daily limit, per-app limits, cooldown duration, max extensions, exercise difficulty, notification/monitoring toggles, onboarding completion (persisted to localStorage)
- **Exercise Store**: completed exercises, stats tracking
- **Onboarding Store**: step tracking for the onboarding flow

## 4. Reusable UI Components
- **Common**: Card, Button variants, AppIcon (emoji-based), EmptyState, LoadingSpinner
- **Charts**: ProgressRing (SVG circular progress), ScreenTimeBarChart (Recharts), WeeklyTrendLine (Recharts), UsageHeatmap
- **Dashboard**: TodaySummaryCard, AppUsageItem (with progress bar), QuickStatsGrid, StreakBadge
- **Exercise**: ExerciseCard, ExerciseTimer (countdown), ExerciseList, CompletionAnimation
- **Intervention**: LimitExceededModal, ExtensionOfferCard, CooldownDisplay (countdown timer)

## 5. Onboarding Flow (4 screens)
- **Welcome Screen**: App intro with illustration, tagline, and "Get Started" CTA
- **Permissions Screen**: Simulated permission requests (usage access, notifications) with toggle switches
- **Setup Limits Screen**: Set daily screen time limit with a slider (30min–6hrs), choose exercise difficulty
- **Onboarding Complete**: Success animation, summary of settings, "Start Monitoring" button

## 6. Main App Screens (Bottom Tab Navigation)
- **Home/Dashboard**: Large progress ring showing time remaining vs daily limit, today's total screen time, top 5 most-used apps with usage bars, quick stats grid (apps used, total visits), pull-to-refresh simulation
- **Apps Screen**: Full list of monitored apps with usage details, category filters (Social, Entertainment, Productivity, etc.), per-app usage breakdown with bar charts, ability to set per-app limits
- **Progress Screen**: Weekly screen time line/bar chart, daily average stat, days-under-limit counter, AI-style insight text, exercise completion stats
- **Settings Screen**: Daily limit adjustment slider, cooldown duration setting, max extensions per day, exercise difficulty selector, notification toggles, monitoring on/off, reset settings, app version info

## 7. Exercise & Intervention Screens
- **Exercise Screen** (modal): Randomly assigned exercise based on difficulty, step-by-step instructions, countdown timer, completion confirmation with celebratory animation
- **Exercise History**: List of completed exercises with dates and durations
- **Limit Exceeded Screen**: Warning display when daily limit is hit, option to do an exercise to earn extension time, cooldown timer between extensions
- **Cooldown Screen**: Visual countdown timer, motivational messaging

## 8. Navigation
- React Router with bottom tab bar navigation (Home, Apps, Progress, Settings)
- Onboarding flow shown on first visit, then main app after completion
- Modal routes for exercise and intervention screens
- Mobile-first responsive layout that also works well on desktop

## 9. Polish & UX
- Smooth transitions between screens
- Loading skeletons while data loads
- Color-coded progress (green → yellow → red as limit approaches)
- Consistent spacing, typography, and card styling throughout
- Dark mode support via Tailwind dark classes
- Mobile-responsive with bottom nav bar on small screens, sidebar option on desktop
