-- =============================================================
-- Screen Guardian — Initial Database Schema
-- Migration: 001_initial_schema
-- =============================================================
-- Enables pgcrypto for UUID generation

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TABLE: profiles
-- One row per authenticated user. Links to Supabase Auth users.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Extended user profile data, linked to Supabase Auth.';

-- =============================================================
-- TABLE: app_limits
-- Cloud backup of per-app usage limits configured on device.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.app_limits (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_id                  TEXT NOT NULL,       -- e.g. 'com.instagram.android'
    app_name                TEXT,
    max_time_minutes        INTEGER NOT NULL DEFAULT 60,
    temp_extension_minutes  INTEGER NOT NULL DEFAULT 0,
    extensions_today        INTEGER NOT NULL DEFAULT 0,
    last_extension_date     DATE,
    enabled                 BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, app_id)
);

COMMENT ON TABLE public.app_limits IS 'Cloud-synced per-app usage limits. Mirrors the device settingsStore.';

-- =============================================================
-- TABLE: usage_snapshots
-- Daily usage summary snapshots synced from the device.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.usage_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    snapshot_date   DATE NOT NULL,
    app_id          TEXT NOT NULL,        -- package name
    app_name        TEXT,
    usage_seconds   INTEGER NOT NULL DEFAULT 0,
    launch_count    INTEGER NOT NULL DEFAULT 0,
    device_id       TEXT,                 -- optional: identify which device
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, snapshot_date, app_id, device_id)
);

COMMENT ON TABLE public.usage_snapshots IS 'Daily per-app usage snapshots synced from device. Used for analytics and AI insights.';

-- =============================================================
-- TABLE: focus_sessions
-- Log of completed Deep Focus sessions.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL,
    ended_at        TIMESTAMPTZ,
    duration_seconds INTEGER,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    notes           TEXT,
    device_id       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.focus_sessions IS 'Log of Deep Focus mode sessions, including duration and completion status.';

-- =============================================================
-- TABLE: ai_insights
-- AI-generated usage analysis and focus recommendations.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    insight_type    TEXT NOT NULL,    -- e.g. 'weekly_summary' | 'recommendation' | 'pattern'
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    metadata        JSONB,            -- flexible extra data (chart data, suggested limits, etc.)
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

COMMENT ON TABLE public.ai_insights IS 'AI-generated insights and recommendations for the user based on their usage data.';

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- Each user can only read/write their own rows.
-- =============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_limits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights     ENABLE ROW LEVEL SECURITY;

-- profiles: users can read and update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- app_limits: users own their rows
CREATE POLICY "app_limits_all_own" ON public.app_limits
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- usage_snapshots: users own their rows
CREATE POLICY "usage_snapshots_all_own" ON public.usage_snapshots
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- focus_sessions: users own their rows
CREATE POLICY "focus_sessions_all_own" ON public.focus_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_insights: users can read their own insights (written by service role)
CREATE POLICY "ai_insights_select_own" ON public.ai_insights
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================
-- TRIGGERS: auto-update `updated_at` on profiles
-- =============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- FUNCTION: auto-create profile on new user signup
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
