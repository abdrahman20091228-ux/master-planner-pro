'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppData, defaultAppData, PrayerTime } from '@/lib/types';

const STORAGE_KEY = 'master-planner-pro-data';

export function useAppData() {
  const [data, setData] = useState<AppData>(defaultAppData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        setData({ 
          ...defaultAppData, 
          ...parsed, 
          settings: { ...defaultAppData.settings, ...parsed.settings },
          lastStreakDate: parsed.lastStreakDate || ''
        });
      } catch {
        setData(defaultAppData);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Update font size CSS variable
      document.documentElement.style.setProperty('--app-font-size', `${data.settings.fontSize}px`);
      // Update theme
      document.documentElement.classList.toggle('dark', data.settings.theme === 'dark');
      // Update direction
      document.documentElement.dir = data.settings.language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = data.settings.language;
    }
  }, [data, isLoaded]);

  // Check for date change and reset prayer times
  useEffect(() => {
    if (!isLoaded) return;
    
    const today = new Date().toDateString();
    if (data.lastActiveDate && data.lastActiveDate !== today) {
      // Reset prayer times completion status
      setData(prev => ({
        ...prev,
        prayerTimes: prev.prayerTimes.map(p => ({ ...p, completed: false })),
        prayerDate: today,
        lastActiveDate: today,
      }));
    } else if (!data.lastActiveDate) {
      setData(prev => ({
        ...prev,
        lastActiveDate: today,
      }));
    }
  }, [isLoaded, data.lastActiveDate]);

  const updateData = useCallback((updates: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppData['settings']>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const updatePrayerCompletion = useCallback((index: number, completed: boolean) => {
    setData(prev => ({
      ...prev,
      prayerTimes: prev.prayerTimes.map((p, i) => 
        i === index ? { ...p, completed } : p
      ),
    }));
  }, []);

  const setPrayerTimes = useCallback((prayers: PrayerTime[]) => {
    const today = new Date().toDateString();
    setData(prev => ({
      ...prev,
      prayerTimes: prayers,
      prayerDate: today,
    }));
  }, []);

  return {
    data,
    isLoaded,
    updateData,
    updateSettings,
    updatePrayerCompletion,
    setPrayerTimes,
  };
}
