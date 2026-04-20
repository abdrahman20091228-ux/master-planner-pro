'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppProvider, useApp } from './app-context';
import { SplashScreen } from './splash-screen';
import { Navigation } from './navigation';
import { ConnectionIndicator } from './connection-indicator';
import { WeeklyPlanner } from './weekly-planner';
import { BrainDump } from './brain-dump';
import { GeminiAssistant } from './gemini-assistant';
import { SettingsPanel } from './settings-panel';

function AppContent() {
  const { isLoaded, t, data } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const isRTL = data.settings.language === 'ar';

  // Auto-hide splash after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setActiveTab(0);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <WeeklyPlanner />;
      case 1:
        return <BrainDump />;
      case 2:
        return <GeminiAssistant />;
      case 3:
        return <SettingsPanel />;
      default:
        return <WeeklyPlanner />;
    }
  };

  return (
    <>
      {/* Splash Screen */}
      <SplashScreen visible={showSplash} onSkip={() => setShowSplash(false)} />

      {/* Main App */}
      <div className="min-h-screen bg-background flex flex-col">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />

        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong">
          <div className="flex items-center justify-between px-4 py-3.5 max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              {/* Back button - only show when not on main tab */}
              {activeTab !== 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBack}
                  className="p-2.5 -ml-2 rounded-xl glass hover:bg-primary/10 transition-colors"
                  aria-label={t.back}
                >
                  {isRTL ? (
                    <ChevronRight className="w-6 h-6 text-foreground" />
                  ) : (
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  )}
                </motion.button>
              )}
              <h1 className="text-xl font-bold text-foreground">{t.appName}</h1>
            </div>
            <ConnectionIndicator />
          </div>
        </header>

        {/* Content - with proper bottom padding for navigation */}
        <main className="relative z-10 flex-1 px-4 pt-6 pb-32 max-w-lg mx-auto w-full overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Navigation - fixed at bottom with safe area */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
}

export function MasterPlanner() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
