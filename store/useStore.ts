import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, User, Language, WatchlistItem } from '@/types';

export type Theme = 'dark' | 'light';

interface ExtendedAppState extends AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
}

// Mock Auth Service
class AuthService {
  private users: Map<string, { email: string; password: string; displayName: string; uid: string }> = new Map();

  async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = this.users.get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=3b82f6&color=fff`,
      emailVerified: true,
    };
  }

  async register(email: string, password: string, displayName: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const uid = `user_${Date.now()}`;
    this.users.set(email, { email, password, displayName, uid });

    return {
      uid,
      email,
      displayName,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`,
      emailVerified: true,
    };
  }

  async loginWithGoogle(): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const uid = `google_${Date.now()}`;
    const displayName = 'Google User';
    const email = 'user@gmail.com';

    return {
      uid,
      email,
      displayName,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`,
      emailVerified: true,
    };
  }
}

const authService = new AuthService();

export const useStore = create<ExtendedAppState>()(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await authService.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true });
        try {
          const user = await authService.register(email, password, displayName);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.loginWithGoogle();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (data: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) throw new Error('No user logged in');

        const updatedUser = { ...currentUser, ...data };
        set({ user: updatedUser });
      },

      // Watchlist State
      items: [],

      addToWatchlist: (id: number, mediaType: 'movie' | 'tv') => {
        const items = get().items;
        if (!items.find((item) => item.id === id)) {
          set({ items: [...items, { id, mediaType, addedAt: Date.now() }] });
        }
      },

      removeFromWatchlist: (id: number) => {
        const items = get().items;
        set({ items: items.filter((item) => item.id !== id) });
      },

      isInWatchlist: (id: number) => {
        const items = get().items;
        return items.some((item) => item.id === id);
      },

      // Language State
      language: 'en',

      setLanguage: (lang: Language) => {
        set({ language: lang });
      },

      // Search History
      searchHistory: [],

      addToSearchHistory: (query: string) => {
        const history = get().searchHistory;
        const filtered = history.filter((q) => q !== query);
        set({ searchHistory: [query, ...filtered].slice(0, 10) });
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      // Theme State
      theme: 'dark',

      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('light', theme === 'light');
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      // Notifications State
      notifications: false,

      setNotifications: (enabled: boolean) => {
        set({ notifications: enabled });
      },
    }),
    {
      name: 'spacefeel-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        items: state.items,
        language: state.language,
        searchHistory: state.searchHistory,
        theme: state.theme,
        notifications: state.notifications,
      }),
    }
  )
);