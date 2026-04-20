'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X, Award, Clock, Target, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from './app-context';
import { Task, dayNames } from '@/lib/types';
import { FocusMode } from './focus-mode';

export function WeeklyPlanner() {
  const { data, t, updateData } = useApp();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = new Date().getDay();
  const todayDateStr = new Date().toDateString();
  const tasks = data.tasks[selectedDay] || [];
  const todayTasks = data.tasks[today] || [];

  // Check if all today's tasks are completed
  const allTodayTasksCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed);

  // Trigger confetti when all tasks are completed
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    });
  }, []);

  // Watch for all tasks completion
  useEffect(() => {
    if (allTodayTasksCompleted && !hasTriggeredConfetti && selectedDay === today) {
      triggerConfetti();
      setHasTriggeredConfetti(true);
    }
    // Reset confetti trigger if tasks become incomplete
    if (!allTodayTasksCompleted) {
      setHasTriggeredConfetti(false);
    }
  }, [allTodayTasksCompleted, hasTriggeredConfetti, triggerConfetti, selectedDay, today]);

  // Scroll to selected day
  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.children[selectedDay] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDay]);

  const addTask = () => {
    if (!newTask.trim()) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    const updatedTasks = { ...data.tasks };
    updatedTasks[selectedDay] = [...(updatedTasks[selectedDay] || []), task];
    updateData({ tasks: updatedTasks });
    setNewTask('');
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = { ...data.tasks };
    updatedTasks[selectedDay] = updatedTasks[selectedDay].filter(t => t.id !== taskId);
    
    // Recalculate streak after deletion
    const allTodayTasks = selectedDay === today ? updatedTasks[today] || [] : data.tasks[today] || [];
    const allCompleted = allTodayTasks.length > 0 && allTodayTasks.every(t => t.completed);
    const wasStreakCountedToday = data.lastStreakDate === todayDateStr;
    
    let newStreak = data.streak;
    // If we had a streak for today but now not all tasks are complete, remove it
    if (wasStreakCountedToday && !allCompleted) {
      newStreak = Math.max(0, data.streak - 1);
    }

    updateData({ 
      tasks: updatedTasks, 
      streak: newStreak,
      lastStreakDate: allCompleted ? todayDateStr : (wasStreakCountedToday ? '' : data.lastStreakDate)
    });
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = { ...data.tasks };
    updatedTasks[selectedDay] = updatedTasks[selectedDay].map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    // Calculate streak based on today's tasks completion status
    const allTodayTasks = selectedDay === today ? updatedTasks[today] : data.tasks[today];
    const allCompleted = allTodayTasks && allTodayTasks.length > 0 && allTodayTasks.every(t => t.completed);
    
    // Check if we already counted today
    const wasStreakCountedToday = data.lastStreakDate === todayDateStr;
    
    let newStreak = data.streak;
    let newLastStreakDate = data.lastStreakDate;
    
    if (allCompleted && !wasStreakCountedToday) {
      // All tasks completed for the first time today - add to streak
      newStreak = (data.streak || 0) + 1;
      newLastStreakDate = todayDateStr;
    } else if (!allCompleted && wasStreakCountedToday) {
      // Tasks were complete but now one is unchecked - remove from streak
      newStreak = Math.max(0, (data.streak || 0) - 1);
      newLastStreakDate = '';
    }

    updateData({ 
      tasks: updatedTasks, 
      streak: newStreak,
      lastStreakDate: newLastStreakDate
    });
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = (taskId: string) => {
    if (!editText.trim()) return;
    
    const updatedTasks = { ...data.tasks };
    updatedTasks[selectedDay] = updatedTasks[selectedDay].map(t => 
      t.id === taskId ? { ...t, text: editText.trim() } : t
    );
    updateData({ tasks: updatedTasks });
    setEditingTask(null);
  };

  const startFocusMode = (task: Task) => {
    setFocusTask(task);
    setFocusMode(true);
  };

  if (focusMode && focusTask) {
    return (
      <FocusMode
        task={focusTask}
        onComplete={() => {
          toggleTask(focusTask.id);
          setFocusMode(false);
          setFocusTask(null);
        }}
        onExit={() => {
          setFocusMode(false);
          setFocusTask(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header with streak */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.weeklyPlanner}</h1>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20">
          <Flame className="w-5 h-5 text-accent" />
          <span className="text-base font-semibold text-accent">{data.streak || 0} {t.days}</span>
        </div>
      </div>

      {/* Days selector - horizontal scroll */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
      >
        {dayNames.map((day, index) => {
          const isToday = index === today;
          const isSelected = index === selectedDay;
          const dayTasks = data.tasks[index] || [];
          const completedCount = dayTasks.filter(t => t.completed).length;

          return (
            <motion.button
              key={day}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(index)}
              className={`relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl min-w-[76px] transition-all flex-shrink-0 ${
                isSelected 
                  ? isToday 
                    ? 'bg-gold text-gold-foreground shadow-lg' 
                    : 'bg-primary text-primary-foreground shadow-lg'
                  : isToday 
                    ? 'glass border-2 border-gold' 
                    : 'glass'
              }`}
            >
              <span className="text-sm font-medium opacity-80">
                {t[day as keyof typeof t]}
              </span>
              <span className={`text-xl font-bold ${isSelected ? '' : 'text-foreground'}`}>
                {new Date(Date.now() + (index - today) * 86400000).getDate()}
              </span>
              {dayTasks.length > 0 && (
                <div className={`flex items-center gap-0.5 text-xs ${isSelected ? '' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" />
                  {completedCount}/{dayTasks.length}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Add task input */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder={t.addTask}
            className="flex-1 px-4 py-3.5 rounded-xl glass bg-card/50 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={addTask}
            className="p-3.5 rounded-xl bg-primary text-primary-foreground shadow-lg flex-shrink-0"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
        
        {/* Warning toast */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl bg-destructive/20 border border-destructive/30 text-destructive text-base text-center z-10"
            >
              {t.emptyTaskWarning}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tasks list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`glass rounded-xl overflow-hidden ${task.completed ? 'opacity-60' : ''}`}
            >
              {editingTask === task.id ? (
                <div className="flex items-center gap-2 p-3">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                    className="flex-1 px-3 py-2 rounded-lg bg-background/50 text-foreground text-base focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(task.id)}
                    className="p-2 rounded-lg bg-success/20 text-success flex-shrink-0"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="p-2 rounded-lg bg-muted text-muted-foreground flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3.5">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-success border-success' 
                        : 'border-muted-foreground'
                    }`}
                  >
                    {task.completed && <Check className="w-5 h-5 text-success-foreground" />}
                  </button>
                  
                  <span 
                    className={`flex-1 text-foreground text-base transition-all min-w-0 break-words ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.text}
                  </span>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!task.completed && (
                      <button
                        onClick={() => startFocusMode(task)}
                        className="p-2.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title={t.focusMode}
                      >
                        <Target className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-12 text-muted-foreground"
          >
            <Clock className="w-14 h-14 opacity-50" />
            <p className="text-lg">{t.addTask}</p>
          </motion.div>
        )}
      </div>

      {/* Today's reward */}
      <div className="glass rounded-xl p-4 mt-2">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-6 h-6 text-gold" />
          <h3 className="font-semibold text-lg text-foreground">{t.reward}</h3>
        </div>
        <input
          type="text"
          value={data.reward || ''}
          onChange={(e) => updateData({ reward: e.target.value })}
          placeholder={t.rewardPlaceholder}
          className="w-full px-4 py-3.5 rounded-lg bg-background/50 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
      </div>
    </div>
  );
}
