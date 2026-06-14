-- =============================================================
-- Migration: 006_achievements
-- Persists achievement unlocks and seen state per user
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id      TEXT NOT NULL,
    progress_value      NUMERIC NOT NULL DEFAULT 0,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    unlocked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    seen_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, achievement_id)
);

COMMENT ON TABLE public.user_achievements IS 'Unlocked achievements and badge seen-state for each user.';

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_all_own" ON public.user_achievements
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_achievements_updated_at
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
