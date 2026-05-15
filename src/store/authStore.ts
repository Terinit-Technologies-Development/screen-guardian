import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user || null });
    });

    try {
      // Get current session from AsyncStorage
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({ session, user: session.user, isInitialized: true });
      } else {
        // Automatically sign in anonymously if no session exists
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        set({ session: data.session, user: data.user, isInitialized: true });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isInitialized: true });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  }
}));
