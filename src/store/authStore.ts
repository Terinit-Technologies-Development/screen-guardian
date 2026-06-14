import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { syncAllFromCloud } from '../services/cloudSyncService';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const getAuthRedirectUrl = (next?: string) => {
  const url = Linking.createURL('auth/callback');
  if (!next) return url;

  return `${url}${url.includes('?') ? '&' : '?'}next=${encodeURIComponent(next)}`;
};

const getParamsFromUrl = (url: string) => {
  const params = new URLSearchParams();
  const queryStart = url.indexOf('?');
  const hashStart = url.indexOf('#');
  const query = queryStart >= 0
    ? url.slice(queryStart + 1, hashStart >= 0 ? hashStart : undefined)
    : '';
  const hash = hashStart >= 0 ? url.slice(hashStart + 1) : '';

  new URLSearchParams(query).forEach((value, key) => params.set(key, value));
  new URLSearchParams(hash).forEach((value, key) => params.set(key, value));

  return params;
};

interface AuthState {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
  isEmailVerified: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  handleAuthCallback: (url: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  pendingVerificationEmail: null,
  isEmailVerified: false,

  initialize: async () => {
    if (get().isInitialized) return;

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({
        session,
        user,
        isEmailVerified: Boolean(user?.email_confirmed_at),
      });
    });

    try {
      // Get current session from AsyncStorage
      const { data: { session } } = await supabase.auth.getSession();

      const user = session?.user ?? null;
      set({
        session,
        user,
        isInitialized: true,
        isEmailVerified: Boolean(user?.email_confirmed_at),
      });

      // Pull all cloud data after auth is initialized
      if (user?.email_confirmed_at) {
        syncAllFromCloud();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isInitialized: true });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null, pendingVerificationEmail: email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user ?? null;
      set({
        session: data.session,
        user,
        isEmailVerified: Boolean(user?.email_confirmed_at),
      });

      if (user?.email_confirmed_at) {
        syncAllFromCloud();
      }
    } catch (error: any) {
      const message = error?.message ?? 'Failed to sign in';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null, pendingVerificationEmail: email });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            display_name: displayName,
          },
        },
      });
      if (error) throw error;

      const user = data.user ?? null;
      set({
        session: data.session,
        user,
        isEmailVerified: Boolean(user?.email_confirmed_at),
      });
    } catch (error: any) {
      const message = error?.message ?? 'Failed to sign up';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const redirectTo = getAuthRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Google sign-in URL was not returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success') {
        await get().handleAuthCallback(result.url);
      }
    } catch (error: any) {
      const message = error?.message ?? 'Failed to sign in with Google';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true, error: null, pendingVerificationEmail: email });
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      if (error) throw error;
    } catch (error: any) {
      const message = error?.message ?? 'Failed to resend verification email';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      set({ user: null, isEmailVerified: false });
      return null;
    }

    set({ user, isEmailVerified: Boolean(user?.email_confirmed_at) });
    if (user?.email_confirmed_at) {
      syncAllFromCloud();
    }

    return user;
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl('/auth/reset-password'),
      });
      if (error) throw error;
    } catch (error: any) {
      const message = error?.message ?? 'Failed to send reset email';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const user = data.user ?? get().user;
      set({ user, isEmailVerified: Boolean(user?.email_confirmed_at) });
    } catch (error: any) {
      const message = error?.message ?? 'Failed to update password';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  handleAuthCallback: async (url) => {
    set({ isLoading: true, error: null });
    try {
      const params = getParamsFromUrl(url);
      const errorDescription = params.get('error_description') ?? params.get('error');
      if (errorDescription) throw new Error(errorDescription);

      const code = params.get('code');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      set({
        session,
        user,
        isEmailVerified: Boolean(user?.email_confirmed_at),
      });

      if (user?.email_confirmed_at) {
        syncAllFromCloud();
      }

      return params.get('next');
    } catch (error: any) {
      const message = error?.message ?? 'Failed to complete authentication';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      isEmailVerified: false,
      pendingVerificationEmail: null,
    });
  }
}));
