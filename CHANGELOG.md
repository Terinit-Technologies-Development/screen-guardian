# Changelog

## 1.2.0 - 2026-06-02

### State Planner
- Added pre-plannable states with calendar-based month view and color-coded state highlights.
- Four states with graduated enforcement: Lock-IN (absolute), Deep Work (strict), Balanced (moderate), Recovery (relaxed).
- Per-category app restrictions enforced by state with realistic time budgets (doomscroll, games, social, messaging, etc.).
- Recurring weekly patterns (e.g. lock-in weekdays, recovery Sundays) with auto-fill.
- Per-app override capability within state enforcement limits.
- Functional balance scoring: focus, recovery, discipline, flexibility with tooltip explanations.
- Adjustment suggestions when planned time budgets exceed average usage.

### Achievements System
- 21 achievements across 9 progressive layers with distinct colors and labels.
- Categories: habits, streaks, work, focus, reading, screen time, and planning.
- Long-term progression incentives for intentional app usage and habit building.

### App Discovery & Configurable Apps
- Android package visibility queries for installed launcher apps.
- Native getInstalledApps() includes launcher apps and recently used apps.
- JS allApps merges installed apps with usage-stats-seen apps.
- Fixed configurable app loading so all installed apps are visible.

### Cloud Sync & Data
- Added state_planner_entries and state_planner_patterns Supabase tables with RLS policies.
- Added active_planner_state column to user_settings for persistent active state.
- State planner data now hydrates from cloud on login via syncAllFromCloud.
- Deleting a recurring pattern now cleans up its generated calendar entries.
- Added hermes-compiler for standalone release APK builds on Windows.

### Build & Bug Fixes
- Standalone release APK builds without Metro dev server using hermes-compiler for Windows bundling.
- Fixed release crash: AppearanceModule.setColorScheme NullPointerException by resolving system theme to device color scheme.
- Fixed modal bottom safe area padding in recurring pattern modal.
- npm audit: 0 vulnerabilities.

## 1.1.0 - 2026-06-01

- Added wellbeing app classification from app detail screens, including game, messaging, social, productive, reading, doomscroll risk, and heightened restriction flags.
- Added automatic active-state app effect calculation for wellbeing scores and app detail previews.
- Added completed/configured badges across wellbeing setup, app details, and the app library.
- Added work cards, session tracking, and wellbeing work-time rollups.
- Added native PDF reading, reading progress tracking, and reading habit targets.
- Added Supabase auth, cloud sync, usage snapshot syncing, and related sync reliability fixes.
- Disabled New Architecture for the current native build compatibility path.
