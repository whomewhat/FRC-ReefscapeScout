import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: true,
      
      toggleDarkMode: () => set((state) => ({ 
        darkMode: !state.darkMode 
      })),
      
      setDarkMode: (enabled) => set({ 
        darkMode: enabled 
      }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2, // Increment version to force reset on schema changes
    }
  )
);

export default useThemeStore;