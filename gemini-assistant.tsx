'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, AlertCircle, Sparkles, Settings } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApp } from './app-context';
import { dayNames } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Skeleton loading component
function SkeletonLoader() {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <Bot className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="flex-1 glass rounded-2xl p-4 space-y-3 max-w-[80%]">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-4 bg-muted/50 rounded w-3/4"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-4 bg-muted/50 rounded w-full"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          className="h-4 bg-muted/50 rounded w-2/3"
        />
      </div>
    </div>
  );
}

export function GeminiAssistant() {
  const { data, t } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContext = () => {
    // If AI context is disabled, return minimal persona only
    if (!data.settings.enableAiContext) {
      return data.settings.language === 'ar'
        ? `أنت مساعد أكاديمي ذكي، حازم ولكن لطيف. وظيفتك هي مساعدة عبد الرحمن في أي سؤال يطرحه. كن مدرباً شخصياً داعماً ومحفزاً.`
        : `You are a smart academic assistant, firm but kind. Your job is to help Abd alrahman with any question he asks. Be a supportive and motivating personal coach.`;
    }

    const lang = data.settings.language;
    const isArabic = lang === 'ar';
    
    // Get all tasks with their days
    const allTasks: string[] = [];
    Object.entries(data.tasks).forEach(([dayIndex, tasks]) => {
      if (tasks.length > 0) {
        const dayKey = dayNames[parseInt(dayIndex)];
        const dayName = t[dayKey as keyof typeof t];
        const taskList = tasks.map(task => 
          `- ${task.text} (${task.completed ? (isArabic ? 'مكتملة' : 'completed') : (isArabic ? 'قيد الانتظار' : 'pending')})`
        ).join('\n');
        allTasks.push(`${dayName}:\n${taskList}`);
      }
    });

    // Get all notes
    const allNotes = data.notes.map(note => `- ${note.content}`).join('\n');

    const systemPersonaAr = `أنت مساعد أكاديمي ذكي، حازم ولكن لطيف (Academic Coach). وظيفتك هي تنظيم وقت عبد الرحمن وتذكيره بأهدافه. 
لا تكن مجرد بوت، بل كن مدرباً شخصياً. إذا سألك عن المذاكرة، حلل المهام التي كتبها، وإذا سألك عن التدوين، اربط أفكاره ببعضها.
كن محفزاً وداعماً، ولكن أيضاً صريحاً إذا لاحظت أنه يتأخر في مهامه.`;

    const systemPersonaEn = `You are a smart academic assistant, firm but kind (Academic Coach). Your job is to organize Abd alrahman's time and remind him of his goals.
Don't just be a bot, be a personal coach. If he asks about studying, analyze the tasks he wrote. If he asks about notes, connect his ideas together.
Be motivating and supportive, but also honest if you notice he's falling behind on his tasks.`;

    const contextAr = `
${systemPersonaAr}

لديك حق الوصول إلى البيانات التالية من تطبيق عبد الرحمن:

المهام الأسبوعية:
${allTasks.length > 0 ? allTasks.join('\n\n') : 'لا توجد مهام مسجلة'}

الأفكار والملاحظات (التدوين الحر):
${allNotes || 'لا توجد ملاحظات مسجلة'}

سلسلة الإنجاز: ${data.streak || 0} يوم
مكافأة اليوم: ${data.reward || 'غير محددة'}

استخدم هذه البيانات لتقديم نصائح مخصصة. مثلاً:
- إذا لاحظت مهام غير مكتملة، اقترح طريقة لإنجازها
- إذا رأيت نمطاً في الملاحظات، ساعد في ربط الأفكار
- شجعه على الحفاظ على سلسلة الإنجاز
`;

    const contextEn = `
${systemPersonaEn}

You have access to the following data from Abd alrahman's app:

Weekly Tasks:
${allTasks.length > 0 ? allTasks.join('\n\n') : 'No tasks recorded'}

Notes and Ideas (Brain Dump):
${allNotes || 'No notes recorded'}

Achievement Streak: ${data.streak || 0} days
Today's Reward: ${data.reward || 'Not set'}

Use this data to provide personalized advice. For example:
- If you notice incomplete tasks, suggest ways to complete them
- If you see patterns in notes, help connect the ideas
- Encourage maintaining the achievement streak
`;

    return isArabic ? contextAr : contextEn;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check API key
    if (!data.settings.geminiApiKey) {
      setError(t.noApiKey);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(data.settings.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const context = getContext();
      const prompt = `${context}\n\nUser: ${userMessage.content}\n\nAssistant:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setError(data.settings.language === 'ar' 
        ? 'حدث خطأ. يرجى التحقق من مفتاح API.'
        : 'An error occurred. Please check your API key.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasApiKey = !!data.settings.geminiApiKey;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.assistant}</h1>
            <p className="text-sm text-muted-foreground">Gemini AI</p>
          </div>
        </div>
        {data.settings.enableAiContext && (
          <div className="px-3 py-1.5 rounded-full bg-success/20 text-success text-xs font-medium">
            {data.settings.language === 'ar' ? 'السياق مفعل' : 'Context ON'}
          </div>
        )}
      </div>

      {/* No API key warning */}
      {!hasApiKey && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-accent/20 border border-accent/30"
        >
          <Settings className="w-6 h-6 text-accent flex-shrink-0" />
          <p className="text-base text-accent">{t.noApiKey}</p>
        </motion.div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
        {messages.length === 0 && hasApiKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <Bot className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">{t.askAssistant}</p>
            {data.settings.enableAiContext && (
              <p className="text-sm text-muted-foreground/70 mt-2">
                {data.settings.language === 'ar' 
                  ? 'المساعد يمكنه قراءة مهامك وملاحظاتك لمساعدتك بشكل أفضل'
                  : 'The assistant can read your tasks and notes to help you better'}
              </p>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gradient-to-br from-primary to-accent'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'glass'
                }`}
              >
                <p className={`text-base leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user' ? '' : 'text-foreground'
                }`}>
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Skeleton loading indicator */}
        {isLoading && <SkeletonLoader />}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-destructive/20 text-destructive"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-base">{error}</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-4 border-t border-border/50 mt-auto">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t.askAssistant}
            disabled={!hasApiKey || isLoading}
            className="flex-1 px-4 py-3.5 rounded-xl glass text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={!hasApiKey || !input.trim() || isLoading}
            className="p-3.5 rounded-xl bg-primary text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
