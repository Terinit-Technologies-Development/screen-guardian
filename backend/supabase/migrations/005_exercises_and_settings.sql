-- =============================================================
-- Migration: 005_exercises_and_settings
-- Adds tables for exercises, exercise_sessions, and user_settings
-- =============================================================

-- =============================================================
-- TABLE: user_settings
-- =============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id                     UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_screen_time_limit     INTEGER NOT NULL DEFAULT 7200,
    cooldown_duration           INTEGER NOT NULL DEFAULT 1800,
    max_extensions              INTEGER NOT NULL DEFAULT 3,
    exercise_difficulty         TEXT NOT NULL DEFAULT 'medium' CHECK (exercise_difficulty IN ('easy', 'medium', 'hard')),
    monitoring_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
    notifications_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    theme                       TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    has_completed_onboarding    BOOLEAN NOT NULL DEFAULT FALSE,
    sync_enabled                BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_settings IS 'Cloud-synced user preferences and application settings.';

-- =============================================================
-- TABLE: exercises
-- =============================================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null for global/system exercises
    name            TEXT NOT NULL,
    description     TEXT,
    duration        INTEGER NOT NULL, -- seconds
    repetitions     INTEGER,
    difficulty      TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category        TEXT NOT NULL CHECK (category IN ('cardio', 'strength', 'flexibility')),
    instructions    TEXT[],
    calories_burned INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.exercises IS 'Library of available physical exercises. Includes global templates and user-created exercises.';

-- =============================================================
-- TABLE: exercise_sessions
-- =============================================================
CREATE TABLE IF NOT EXISTS public.exercise_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id         UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    exercise_name       TEXT NOT NULL,
    completed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds    INTEGER NOT NULL,
    context             TEXT NOT NULL CHECK (context IN ('limit_exceeded', 'extension_requested')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.exercise_sessions IS 'Logs of exercises completed by users to unlock screen time extensions.';

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.user_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions  ENABLE ROW LEVEL SECURITY;

-- user_settings
CREATE POLICY "user_settings_select_own" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- exercises
-- Users can see global exercises (user_id IS NULL) and their own exercises
CREATE POLICY "exercises_select_all" ON public.exercises
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
-- Users can only modify their own exercises
CREATE POLICY "exercises_all_own" ON public.exercises
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- exercise_sessions
CREATE POLICY "exercise_sessions_all_own" ON public.exercise_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- TRIGGERS
-- =============================================================
CREATE TRIGGER trg_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
