-- =============================================================
-- Migration: 003_habits_and_work
-- Adds tables for motivations, habits, habit_logs, and work_sessions
-- =============================================================

-- =============================================================
-- TABLE: motivations
-- =============================================================
CREATE TABLE IF NOT EXISTS public.motivations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    image_url       TEXT,
    display_order   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: habits
-- =============================================================
CREATE TABLE IF NOT EXISTS public.habits (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title                   TEXT NOT NULL,
    description             TEXT,
    type                    TEXT NOT NULL CHECK (type IN ('build', 'quit')),
    frequency               TEXT NOT NULL DEFAULT 'daily',
    icon                    TEXT DEFAULT 'Circle',
    color                   TEXT DEFAULT '#06b6d4',
    is_screen_time_linked   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: habit_logs
-- =============================================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    habit_id        UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    log_date        DATE NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('completed', 'skipped', 'failed')),
    notes           TEXT,
    logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(habit_id, log_date)
);

-- =============================================================
-- TABLE: work_sessions
-- =============================================================
CREATE TABLE IF NOT EXISTS public.work_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT,
    category            TEXT,
    start_time          TIMESTAMPTZ NOT NULL,
    end_time            TIMESTAMPTZ,
    duration_seconds    INTEGER,
    perceived_effect    TEXT CHECK (perceived_effect IN ('positive', 'neutral', 'negative')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.motivations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- motivations
CREATE POLICY "motivations_all_own" ON public.motivations
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- habits
CREATE POLICY "habits_all_own" ON public.habits
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- habit_logs
CREATE POLICY "habit_logs_all_own" ON public.habit_logs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- work_sessions
CREATE POLICY "work_sessions_all_own" ON public.work_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- TRIGGERS
-- =============================================================
CREATE TRIGGER trg_motivations_updated_at
    BEFORE UPDATE ON public.motivations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
