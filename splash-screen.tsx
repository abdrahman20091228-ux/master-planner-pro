'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './app-context';

interface SplashScreenProps {
  onSkip: () => void;
  visible: boolean;
}

const quotes = {
  ar: [
    'الحياة ليست عن إيجاد نفسك، بل عن خلق نفسك.',
    'النجاح هو الانتقال من فشل إلى فشل دون فقدان الحماس.',
    'الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.',
    'كل يوم هو فرصة جديدة لتغيير حياتك.',
    'الصبر مفتاح الفرج.',
  ],
  en: [
    'Life is not about finding yourself, it is about creating yourself.',
    'Success is going from failure to failure without losing enthusiasm.',
    'The only way to do great work is to love what you do.',
    'Every day is a new opportunity to change your life.',
    'Patience is the key to relief.',
  ],
};

export function SplashScreen({ onSkip, visible }: SplashScreenProps) {
  const { t, data } = useApp();
  const lang = data.settings.language;
  const randomQuote = quotes[lang][Math.floor(Math.random() * quotes[lang].length)];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/20"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
          >
            {/* Logo */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold text-primary-foreground">M</span>
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/50 to-accent/50 blur-xl -z-10" />
            </motion.div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-foreground"
            >
              {t.appName}
            </motion.h1>

            {/* Floating quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                y: [0, -10, 0],
              }}
              transition={{ 
                opacity: { delay: 0.8 },
                y: { 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="text-lg text-muted-foreground max-w-xs leading-relaxed italic"
            >
              &quot;{randomQuote}&quot;
            </motion.p>
          </motion.div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            onClick={onSkip}
            className="absolute bottom-24 px-8 py-3.5 rounded-full glass text-foreground text-lg font-medium hover:bg-primary/10 transition-colors"
          >
            {t.skip}
          </motion.button>

          {/* Created by signature */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 text-sm text-white"
          >
            Created by Abd alrahman
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
