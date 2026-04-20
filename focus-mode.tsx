'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Check, Volume2 } from 'lucide-react';
import { useApp } from './app-context';
import { Task } from '@/lib/types';

interface FocusModeProps {
  task: Task;
  onComplete: () => void;
  onExit: () => void;
}

export function FocusMode({ task, onComplete, onExit }: FocusModeProps) {
  const { t } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio play failed, likely due to autoplay restrictions
      });
    }
  }, []);

  useEffect(() => {
    // Create audio element for alarm
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2DgIJ/gHp7fH1/gH19ent7e3p7e3t8fHx8fHx8fHx8fHx8fHx8fHx8fX19fX19fX19fX5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn9/f39/f39/f39/f39/f39/f39/f4CAgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYKCgoKCgoKCgoKCgoKCgoKCgoKCgoKDg4ODg4ODg4ODg4ODg4ODg4ODg4SDhISEhISEhISEhISEhISEhISEhISFhYWFhYWFhYWFhYWFhYWFhYWFhYaGhoaGhoaGhoaGhoaGhoaGhoaGhoaHh4eHh4eHh4eHh4eHh4eHh4eHh4eIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiYmJiYmJiYmJiYmJiYmJiYmJiYmJiomJiYmJiYmJiYmJiYmJiYmJiYmJiYiIiIiIiIiIiIiIiIiIiIiIiIiIiIeHh4eHh4eHh4eHh4eHh4eHh4eHh4aGhoaGhoaGhoaGhoaGhoaGhoaGhoWFhYWFhYWFhYWFhYWFhYWFhYWFhISEhISEhISEhISEhISEhISEhISEg4ODg4ODg4ODg4ODg4ODg4ODg4OCgoKCgoKCgoKCgoKCgoKCgoKCgoKBgYGBgYGBgYGBgYGBgYGBgYGBgYGAgICAgICAgICAgICAgICAgICAgICAf39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fX19fX19fX19fX19fX19fX19fX18fHx8fHx8fHx8fHx8fHx8fHx8fHx7e3t7e3t7e3t7e3t7e3t7e3t7e3t6enp6enp6enp6');

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, playAlarm]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setTimeLeft(customMinutes * 60);
    setIsRunning(false);
  };

  const setCustomTime = (minutes: number) => {
    setCustomMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const progress = 1 - timeLeft / (customMinutes * 60);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-6 right-6 p-3 rounded-full glass text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Current task */}
        <div className="glass rounded-2xl p-6 w-full text-center">
          <p className="text-base text-muted-foreground mb-2">{t.currentTask}</p>
          <h2 className="text-2xl font-bold text-foreground">{task.text}</h2>
        </div>

        {/* Timer circle */}
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-primary"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold text-foreground font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-base text-muted-foreground mt-2">{t.timer}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="p-4 rounded-full glass text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-7 h-7" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRunning(!isRunning)}
            className="p-6 rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            {isRunning ? <Pause className="w-9 h-9" /> : <Play className="w-9 h-9" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onComplete}
            className="p-4 rounded-full glass text-success hover:bg-success/10 transition-colors"
          >
            <Check className="w-7 h-7" />
          </motion.button>
        </div>

        {/* Custom timer presets */}
        <div className="flex flex-wrap justify-center gap-2">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => setCustomTime(mins)}
              className={`px-5 py-2.5 rounded-full text-base font-semibold transition-all ${
                customMinutes === mins
                  ? 'bg-primary text-primary-foreground'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {mins} {t.minutes}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="180"
            value={customMinutes}
            onChange={(e) => setCustomTime(Math.max(1, Math.min(180, parseInt(e.target.value) || 1)))}
            className="w-24 px-4 py-3 rounded-lg glass text-center text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <span className="text-muted-foreground text-base">{t.minutes}</span>
        </div>

        {/* Sound indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Volume2 className="w-5 h-5" />
          <span>{t.focusTimer}</span>
        </div>
      </div>
    </motion.div>
  );
}
