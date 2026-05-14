-- =============================================================
-- Migration: 004_long_term_screen_time
-- Adds table for aggregating daily total screen time over the long term
-- =============================================================

CREATE TABLE IF NOT EXISTS public.daily_screen_time_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date        DATE NOT NULL,
    total_seconds   INTEGER NOT NULL DEFAULT 0,
    limit_seconds   INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, log_date)
);

COMMENT ON TABLE public.daily_screen_time_logs IS 'Daily aggregated total screen time for long-term tracking and charting.';

ALTER TABLE public.daily_screen_time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_screen_time_logs_all_own" ON public.daily_screen_time_logs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_daily_screen_time_logs_updated_at
    BEFORE UPDATE ON public.daily_screen_time_logs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
