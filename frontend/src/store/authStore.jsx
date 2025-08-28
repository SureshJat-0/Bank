import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      name: null,
      email: null,

      setAuth: ({ token, role, userId, name, email }) =>
        set({ token, role, userId, name, email }),

      clearAuth: () =>
        set({ token: null, role: null, userId: null, name: null, email: null }),

      updateProfile: ({ name, email }) =>
        set((state) => ({ ...state, name, email })),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        userId: state.userId,
        name: state.name,
        email: state.email,
      }),
    }
  )
);

export default useAuthStore;
