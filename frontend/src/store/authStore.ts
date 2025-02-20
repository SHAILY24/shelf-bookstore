import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types'; // Assuming User type defined in types.ts

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  // Potentially add a function to load user data if token exists but user is null on startup
  // loadUser: () => Promise<void>; 
}

// Helper to check initial state
const getInitialState = () => {
  const token = localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : null;
  // We won't persist the full user object to avoid stale data, just the token.
  // User info will be fetched using the token if needed.
  return {
    token: token || null,
    user: null, // User data fetched on app load or login
    isLoggedIn: !!token, // User is logged in if token exists
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...getInitialState(),

      setAuth: (token: string, user: User) => {
        set({ token, user, isLoggedIn: true });
      },

      logout: () => {
        set({ token: null, user: null, isLoggedIn: false });
        // Note: The persist middleware handles clearing the token from localStorage
        // based on the name 'auth-storage'.
      },

      // Example function to load user if token exists but user data is missing
      /*
      loadUser: async () => {
        const { token } = useAuthStore.getState();
        if (token && !useAuthStore.getState().user) {
          try {
            // Assume an api function getCurrentUser exists
            // const userData = await api.getCurrentUser(); 
            console.log("Need to implement user loading");
          } catch (error) {
            console.error("Failed to load user data, logging out:", error);
            set({ token: null, user: null, isLoggedIn: false });
        }
      }
      */
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Persist state
      partialize: (state) => ({ token: state.token }), // Only persist the token
    }
  )
); 