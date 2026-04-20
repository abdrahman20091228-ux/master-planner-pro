export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface DayTasks {
  [dayIndex: number]: Task[];
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  completed: boolean;
}

export interface Settings {
  language: 'ar' | 'en';
  fontSize: number;
  theme: 'light' | 'dark';
  geminiApiKey: string;
  enableAiContext: boolean;
}

export interface AppData {
  tasks: DayTasks;
  notes: Note[];
  streak: number;
  lastActiveDate: string;
  lastStreakDate: string; // Track the last day streak was counted
  reward: string;
  prayerTimes: PrayerTime[];
  prayerDate: string;
  settings: Settings;
}

export const defaultSettings: Settings = {
  language: 'ar',
  fontSize: 18,
  theme: 'dark',
  geminiApiKey: '',
  enableAiContext: true,
};

export const defaultAppData: AppData = {
  tasks: {},
  notes: [],
  streak: 0,
  lastActiveDate: '',
  lastStreakDate: '',
  reward: '',
  prayerTimes: [],
  prayerDate: '',
  settings: defaultSettings,
};

export const translations = {
  ar: {
    appName: 'Master Planner Pro',
    weeklyPlanner: 'الأسبوع الذكي',
    brainDump: 'التدوين الحر',
    assistant: 'مساعدك الذكي',
    settings: 'الإعدادات',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    addTask: 'أضف مهمة...',
    emptyTaskWarning: 'لا يمكن إضافة مهمة فارغة!',
    streak: 'سلسلة الإنجاز',
    days: 'يوم',
    reward: 'مكافأة اليوم',
    rewardPlaceholder: 'اكتب مكافأتك...',
    focusMode: 'وضع التركيز العميق',
    currentTask: 'المهمة الحالية',
    timer: 'المؤقت',
    exitFocus: 'إنهاء التركيز',
    addNote: 'أضف فكرة جديدة...',
    noNotes: 'لا توجد أفكار بعد',
    askAssistant: 'اسأل المساعد الذكي...',
    send: 'إرسال',
    thinking: 'جاري التفكير...',
    noApiKey: 'يرجى إضافة مفتاح API في الإعدادات',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    fontSize: 'حجم الخط',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    exportData: 'تصدير البيانات',
    exportSuccess: 'تم التصدير بنجاح!',
    prayerTimes: 'مواقيت الصلاة',
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    focusTimer: 'مؤقت التركيز',
    start: 'بدء',
    pause: 'إيقاف',
    reset: 'إعادة',
    customTimer: 'مؤقت مخصص',
    stopwatch: 'ساعة إيقاف',
    minutes: 'دقيقة',
    apiKey: 'مفتاح Gemini API',
    enterApiKey: 'أدخل مفتاح API...',
    online: 'متصل',
    offline: 'غير متصل',
    skip: 'تخطي',
    quote: 'الحياة ليست عن إيجاد نفسك، بل عن خلق نفسك.',
    welcomeBack: 'مرحباً بعودتك',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    location: 'إهناسيا، بني سويف',
    apply: 'تطبيق',
    apiKeyApplied: 'تم تفعيل المفتاح!',
    back: 'رجوع',
    allTasksComplete: 'أحسنت! أكملت جميع المهام!',
    enableAiContext: 'تفعيل سياق الذكاء الاصطناعي',
    enableAiContextDesc: 'السماح للمساعد بقراءة المهام والملاحظات',
    streakSettings: 'إعدادات سلسلة الإنجاز',
    resetStreak: 'تصفير السلسلة',
    editStreak: 'تعديل السلسلة',
    currentStreak: 'السلسلة الحالية',
    createdBy: 'تم إنشاؤه بواسطة',
  },
  en: {
    appName: 'Master Planner Pro',
    weeklyPlanner: 'Smart Week',
    brainDump: 'Brain Dump',
    assistant: 'Smart Assistant',
    settings: 'Settings',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    addTask: 'Add task...',
    emptyTaskWarning: 'Cannot add empty task!',
    streak: 'Streak',
    days: 'days',
    reward: "Today's Reward",
    rewardPlaceholder: 'Write your reward...',
    focusMode: 'Deep Focus Mode',
    currentTask: 'Current Task',
    timer: 'Timer',
    exitFocus: 'Exit Focus',
    addNote: 'Add new idea...',
    noNotes: 'No ideas yet',
    askAssistant: 'Ask the smart assistant...',
    send: 'Send',
    thinking: 'Thinking...',
    noApiKey: 'Please add API key in Settings',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    fontSize: 'Font Size',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    exportData: 'Export Data',
    exportSuccess: 'Exported successfully!',
    prayerTimes: 'Prayer Times',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    focusTimer: 'Focus Timer',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    customTimer: 'Custom Timer',
    stopwatch: 'Stopwatch',
    minutes: 'min',
    apiKey: 'Gemini API Key',
    enterApiKey: 'Enter API key...',
    online: 'Online',
    offline: 'Offline',
    skip: 'Skip',
    quote: 'Life is not about finding yourself, it is about creating yourself.',
    welcomeBack: 'Welcome Back',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    location: 'Ehnasia, Beni Suef',
    apply: 'Apply',
    apiKeyApplied: 'API Key Applied!',
    back: 'Back',
    allTasksComplete: 'Great job! All tasks completed!',
    enableAiContext: 'Enable AI Context',
    enableAiContextDesc: 'Allow assistant to read tasks and notes',
    streakSettings: 'Streak Settings',
    resetStreak: 'Reset Streak',
    editStreak: 'Edit Streak',
    currentStreak: 'Current Streak',
    createdBy: 'Created by',
  },
};

export const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
