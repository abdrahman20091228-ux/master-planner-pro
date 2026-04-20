'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { AppData, translations, PrayerTime } from '@/lib/types';

interface AppContextType {
  data: AppData;
  isLoaded: boolean;
  t: typeof translations.ar;
  updateData: (updates: Partial<AppData>) => void;
  updateSettings: (updates: Partial<AppData['settings']>) => void;
  updatePrayerCompletion: (index: number, completed: boolean) => void;
  setPrayerTimes: (prayers: PrayerTime[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { data, isLoaded, updateData, updateSettings, updatePrayerCompletion, setPrayerTimes } = useAppData();
  
  const t = translations[data.settings.language];

  return (
    <AppContext.Provider value={{ 
      data, 
      isLoaded, 
      t, 
      updateData, 
      updateSettings,
      updatePrayerCompletion,
      setPrayerTimes,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
