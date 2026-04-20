'use client';

import { motion } from 'framer-motion';
import { Calendar, Brain, Bot, Settings } from 'lucide-react';
import { useApp } from './app-context';

interface NavigationProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useApp();

  const tabs = [
    { icon: Calendar, label: t.weeklyPlanner },
    { icon: Brain, label: t.brainDump },
    { icon: Bot, label: t.assistant },
    { icon: Settings, label: t.settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1">
      {/* Safe area background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
      
      <div className="relative glass-strong rounded-2xl p-2 max-w-md mx-auto shadow-xl">
        <div className="flex items-center justify-around gap-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;

            return (
              <button
                key={index}
                onClick={() => onTabChange(index)}
                className="relative flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl transition-colors flex-1 min-w-0"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/15 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon 
                  className={`w-6 h-6 relative z-10 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span 
                  className={`text-[11px] relative z-10 transition-colors truncate max-w-full ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
