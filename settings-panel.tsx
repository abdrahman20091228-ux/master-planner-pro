'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Type, 
  Sun, 
  Moon, 
  Download, 
  Key, 
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Timer,
  AlertCircle,
  Check,
  BrainCircuit,
  Flame,
  Minus,
  Plus,
  RotateCw
} from 'lucide-react';
import { useApp } from './app-context';
import { PrayerTime } from '@/lib/types';

export function SettingsPanel() {
  const { data, t, updateSettings, updatePrayerCompletion, setPrayerTimes, updateData } = useApp();
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(false);
  const [prayerError, setPrayerError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(data.settings.geminiApiKey);
  const [apiKeyApplied, setApiKeyApplied] = useState(false);
  const [editingStreak, setEditingStreak] = useState(false);
  const [streakInput, setStreakInput] = useState(data.streak || 0);
  
  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  
  // Custom timer state
  const [customTimerMinutes, setCustomTimerMinutes] = useState(25);
  const [customTimerTime, setCustomTimerTime] = useState(0);
  const [customTimerRunning, setCustomTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'timer' | 'stopwatch'>('timer');

  // Sync API key input with stored value when data loads
  useEffect(() => {
    setApiKeyInput(data.settings.geminiApiKey);
  }, [data.settings.geminiApiKey]);

  // Sync streak input
  useEffect(() => {
    setStreakInput(data.streak || 0);
  }, [data.streak]);

  // Apply API key handler
  const applyApiKey = () => {
    updateSettings({ geminiApiKey: apiKeyInput.trim() });
    setApiKeyApplied(true);
    setTimeout(() => setApiKeyApplied(false), 3000);
  };

  // Streak handlers
  const handleStreakChange = (delta: number) => {
    const newStreak = Math.max(0, streakInput + delta);
    setStreakInput(newStreak);
    updateData({ streak: newStreak });
  };

  const resetStreak = () => {
    setStreakInput(0);
    updateData({ streak: 0, lastStreakDate: '' });
  };

  // Fetch prayer times
  const fetchPrayerTimes = useCallback(async () => {
    setIsLoadingPrayers(true);
    setPrayerError('');

    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      // Ehnasia, Beni Suef coordinates
      const lat = 29.0836;
      const lng = 30.7962;

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=5`
      );

      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      const timings = result.data.timings;

      const prayers: PrayerTime[] = [
        { name: 'fajr', nameAr: t.fajr, time: timings.Fajr, completed: false },
        { name: 'sunrise', nameAr: t.sunrise, time: timings.Sunrise, completed: false },
        { name: 'dhuhr', nameAr: t.dhuhr, time: timings.Dhuhr, completed: false },
        { name: 'asr', nameAr: t.asr, time: timings.Asr, completed: false },
        { name: 'maghrib', nameAr: t.maghrib, time: timings.Maghrib, completed: false },
        { name: 'isha', nameAr: t.isha, time: timings.Isha, completed: false },
      ];

      // Preserve completion status from existing data
      const existingPrayers = data.prayerTimes;
      prayers.forEach((prayer, index) => {
        if (existingPrayers[index]) {
          prayer.completed = existingPrayers[index].completed;
        }
      });

      setPrayerTimes(prayers);
    } catch {
      setPrayerError(data.settings.language === 'ar' 
        ? 'فشل في جلب مواقيت الصلاة'
        : 'Failed to fetch prayer times'
      );
    } finally {
      setIsLoadingPrayers(false);
    }
  }, [data.prayerTimes, data.settings.language, setPrayerTimes, t.asr, t.dhuhr, t.fajr, t.isha, t.maghrib, t.sunrise]);

  // Auto-fetch prayer times
  useEffect(() => {
    const today = new Date().toDateString();
    if (data.prayerDate !== today && data.prayerTimes.length === 0) {
      fetchPrayerTimes();
    }
  }, [data.prayerDate, data.prayerTimes.length, fetchPrayerTimes]);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  // Custom timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (customTimerRunning && customTimerTime > 0) {
      interval = setInterval(() => {
        setCustomTimerTime(prev => {
          if (prev <= 1) {
            setCustomTimerRunning(false);
            // Play sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2DgIJ/gHp7fH1/gH19ent7e3p7e3t8fHx8fHx8fHx8fHx8fHx8fHx8fX19fX19fX19fX5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn9/f39/f39/f39/f39/f39/f39/f4CAgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYKCgoKCgoKCgoKCgoKCgoKCgoKCgoKDg4ODg4ODg4ODg4ODg4ODg4ODg4SDhISEhISEhISEhISEhISEhISEhISFhYWFhYWFhYWFhYWFhYWFhYWFhYaGhoaGhoaGhoaGhoaGhoaGhoaGhoaHh4eHh4eHh4eHh4eHh4eHh4eHh4eIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiYmJiYmJiYmJiYmJiYmJiYmJiYmJiomJiYmJiYmJiYmJiYmJiYmJiYmJiYiIiIiIiIiIiIiIiIiIiIiIiIiIiIeHh4eHh4eHh4eHh4eHh4eHh4eHh4aGhoaGhoaGhoaGhoaGhoaGhoaGhoWFhYWFhYWFhYWFhYWFhYWFhYWFhISEhISEhISEhISEhISEhISEhISEg4ODg4ODg4ODg4ODg4ODg4ODg4OCgoKCgoKCgoKCgoKCgoKCgoKCgoKBgYGBgYGBgYGBgYGBgYGBgYGBgYGAgICAgICAgICAgICAgICAgICAgICAf39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fX19fX19fX19fX19fX19fX19fX18fHx8fHx8fHx8fHx8fHx8fHx8fHx7e3t7e3t7e3t7e3t7e3t7e3t7e3t6enp6enp6enp6');
            audio.play().catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [customTimerRunning, customTimerTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCustomTimer = () => {
    setCustomTimerTime(customTimerMinutes * 60);
    setCustomTimerRunning(true);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-planner-pro-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  // Check if a prayer is actually a prayer (not sunrise)
  const isPrayer = (prayerName: string) => prayerName !== 'sunrise';

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <h1 className="text-2xl font-bold text-foreground">{t.settings}</h1>

      {/* Language */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">{t.language}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ language: 'ar' })}
            className={`flex-1 py-3.5 rounded-lg font-semibold text-base transition-all ${
              data.settings.language === 'ar'
                ? 'bg-primary text-primary-foreground'
                : 'glass text-foreground hover:bg-primary/10'
            }`}
          >
            {t.arabic}
          </button>
          <button
            onClick={() => updateSettings({ language: 'en' })}
            className={`flex-1 py-3.5 rounded-lg font-semibold text-base transition-all ${
              data.settings.language === 'en'
                ? 'bg-primary text-primary-foreground'
                : 'glass text-foreground hover:bg-primary/10'
            }`}
          >
            {t.english}
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Type className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">{t.fontSize}</h3>
          </div>
          <span className="text-base font-medium text-muted-foreground">{data.settings.fontSize}px</span>
        </div>
        <input
          type="range"
          min="14"
          max="26"
          value={data.settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
          className="w-full h-3 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>14px</span>
          <span>26px</span>
        </div>
      </div>

      {/* Theme */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          {data.settings.theme === 'dark' ? (
            <Moon className="w-6 h-6 text-primary" />
          ) : (
            <Sun className="w-6 h-6 text-primary" />
          )}
          <h3 className="font-semibold text-lg text-foreground">{t.theme}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-base transition-all ${
              data.settings.theme === 'light'
                ? 'bg-primary text-primary-foreground'
                : 'glass text-foreground hover:bg-primary/10'
            }`}
          >
            <Sun className="w-5 h-5" />
            {t.light}
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-base transition-all ${
              data.settings.theme === 'dark'
                ? 'bg-primary text-primary-foreground'
                : 'glass text-foreground hover:bg-primary/10'
            }`}
          >
            <Moon className="w-5 h-5" />
            {t.dark}
          </button>
        </div>
      </div>

      {/* Streak Settings */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-6 h-6 text-accent" />
          <h3 className="font-semibold text-lg text-foreground">{t.streakSettings}</h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-base text-foreground">{t.currentStreak}</span>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleStreakChange(-1)}
              className="w-10 h-10 rounded-lg glass flex items-center justify-center text-foreground hover:bg-primary/10"
            >
              <Minus className="w-5 h-5" />
            </motion.button>
            <span className="text-2xl font-bold text-accent min-w-[60px] text-center">{streakInput}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleStreakChange(1)}
              className="w-10 h-10 rounded-lg glass flex items-center justify-center text-foreground hover:bg-primary/10"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={resetStreak}
          className="w-full py-3 rounded-lg glass text-destructive font-semibold text-base flex items-center justify-center gap-2 hover:bg-destructive/10"
        >
          <RotateCw className="w-5 h-5" />
          {t.resetStreak}
        </motion.button>
      </div>

      {/* Gemini API Key */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">{t.apiKey}</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={t.enterApiKey}
            className="flex-1 px-4 py-3.5 rounded-lg bg-background/50 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={applyApiKey}
            className={`px-5 py-3.5 rounded-lg font-semibold text-base transition-all flex items-center gap-2 ${
              apiKeyApplied 
                ? 'bg-success text-success-foreground' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {apiKeyApplied ? (
              <Check className="w-5 h-5" />
            ) : (
              t.apply
            )}
          </motion.button>
        </div>
        {apiKeyApplied && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-success"
          >
            {t.apiKeyApplied}
          </motion.p>
        )}
      </div>

      {/* Enable AI Context Toggle */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-semibold text-lg text-foreground">{t.enableAiContext}</h3>
              <p className="text-sm text-muted-foreground">{t.enableAiContextDesc}</p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ enableAiContext: !data.settings.enableAiContext })}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              data.settings.enableAiContext ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <motion.div
              animate={{ x: data.settings.enableAiContext ? 24 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
            />
          </button>
        </div>
      </div>

      {/* Prayer Times */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-semibold text-lg text-foreground">{t.prayerTimes}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {t.location}
              </p>
            </div>
          </div>
          <button
            onClick={fetchPrayerTimes}
            disabled={isLoadingPrayers}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-base font-semibold disabled:opacity-50"
          >
            {isLoadingPrayers ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              data.settings.language === 'ar' ? 'تحديث' : 'Refresh'
            )}
          </button>
        </div>

        {prayerError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/20 text-destructive text-base">
            <AlertCircle className="w-5 h-5" />
            {prayerError}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {data.prayerTimes.map((prayer, index) => (
            <div
              key={prayer.name}
              className="flex items-center justify-between py-3 px-4 rounded-lg bg-background/30"
            >
              <div className="flex items-center gap-3">
                {isPrayer(prayer.name) ? (
                  <button
                    onClick={() => updatePrayerCompletion(index, !prayer.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      prayer.completed
                        ? 'bg-success border-success'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {prayer.completed && <CheckCircle2 className="w-4 h-4 text-success-foreground" />}
                  </button>
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-gold" />
                  </div>
                )}
                <span className={`text-foreground text-base ${prayer.completed && isPrayer(prayer.name) ? 'line-through opacity-60' : ''}`}>
                  {data.settings.language === 'ar' ? prayer.nameAr : prayer.name.charAt(0).toUpperCase() + prayer.name.slice(1)}
                </span>
              </div>
              <span className="text-base font-mono text-muted-foreground">
                {prayer.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Timer / Stopwatch */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Timer className="w-6 h-6 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">{t.focusTimer}</h3>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTimerMode('timer')}
            className={`flex-1 py-2.5 rounded-lg text-base font-semibold transition-all ${
              timerMode === 'timer'
                ? 'bg-primary text-primary-foreground'
                : 'glass text-foreground hover:bg-primary/10'
            }`}
          >
            {t.customTimer}
          </button>
          <button
            onClick={() => setTimerMode('stopwatch')}
            className={`flex-1 py-2.5 rounded-lg text-base font-semibold transition-all ${
              timerMode === 'stopwatch'
                ? 'bg-primary text-primary-foreground'
                : 'glass text-foreground hover:bg-primary/10'
            }`}
          >
            {t.stopwatch}
          </button>
        </div>

        {timerMode === 'timer' ? (
          <div className="flex flex-col gap-4">
            {/* Timer display */}
            <div className="text-center py-6">
              <span className="text-5xl font-mono font-bold text-foreground">
                {formatTime(customTimerTime)}
              </span>
            </div>

            {/* Timer input */}
            {!customTimerRunning && customTimerTime === 0 && (
              <div className="flex items-center gap-2 justify-center">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customTimerMinutes}
                  onChange={(e) => setCustomTimerMinutes(Math.max(1, Math.min(180, parseInt(e.target.value) || 1)))}
                  className="w-24 px-4 py-2.5 rounded-lg glass text-center text-foreground text-lg focus:outline-none"
                />
                <span className="text-muted-foreground text-base">{t.minutes}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {customTimerTime === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={startCustomTimer}
                  className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg"
                >
                  {t.start}
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCustomTimerRunning(!customTimerRunning)}
                    className="p-4 rounded-xl bg-primary text-primary-foreground"
                  >
                    {customTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setCustomTimerRunning(false);
                      setCustomTimerTime(0);
                    }}
                    className="p-4 rounded-xl glass text-muted-foreground"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stopwatch display */}
            <div className="text-center py-6">
              <span className="text-5xl font-mono font-bold text-foreground">
                {formatTime(stopwatchTime)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setStopwatchRunning(!stopwatchRunning)}
                className="p-4 rounded-xl bg-primary text-primary-foreground"
              >
                {stopwatchRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setStopwatchRunning(false);
                  setStopwatchTime(0);
                }}
                className="p-4 rounded-xl glass text-muted-foreground"
              >
                <RotateCcw className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Export Data */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={exportData}
        className="glass rounded-xl p-4 flex items-center justify-between group hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg text-foreground">{t.exportData}</span>
        </div>
        {exportSuccess && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-success text-base"
          >
            {t.exportSuccess}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
