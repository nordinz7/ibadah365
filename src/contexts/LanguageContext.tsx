import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { preferencesManager } from '../utils/preferencesManager';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  t: (key: string, params?: Record<string, string>) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation strings
const translations = {
  en: {
    // App
    appName: 'ibadah365',
    appSubtitle: 'Islamic Calendar & Reminders',
    
    // Navigation
    calendar: 'Calendar',
    events: 'Events',
    settings: 'Settings',
    
    // Calendar
    today: 'Today',
    thisMonth: 'This Month',
    nextMonth: 'Next Month',
    
    // Events
    upcomingEvents: 'Upcoming Events',
    noEventsToday: 'No events today',
    noEventsThisMonth: 'No events this month',
    
    // Event Categories
    fasting: 'Fasting',
    prayer: 'Prayer',
    quran: 'Quran',
    eid: 'Eid',
    hajj: 'Hajj',
    takbeer: 'Takbeer',
    adhkar: 'Adhkar',
    ramadanCategory: 'Ramadan',
    
    // Settings
    preferences: 'Preferences',
    notifications: 'Notifications',
    hijriOffset: 'Hijri Date Adjustment',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    prayerTimes: 'Prayer Times',
    categories: 'Event Categories',
    reminderTimes: 'Reminder Times',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    reset: 'Reset',
    enable: 'Enable',
    disable: 'Disable',
    test: 'Test',
    
    // Days
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Prayer names
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    
    // Months
    muharram: 'Muharram',
    safar: 'Safar',
    rabiAlAwwal: 'Rabi\' al-Awwal',
    rabiAlThani: 'Rabi\' al-Thani',
    jumadaAlAwwal: 'Jumada al-Awwal',
    jumadaAlThani: 'Jumada al-Thani',
    rajab: 'Rajab',
    shaban: 'Sha\'ban',
    ramadan: 'Ramadan',
    shawwal: 'Shawwal',
    dhulQidah: 'Dhul-Qi\'dah',
    dhulHijjah: 'Dhul-Hijjah',
  },
  ar: {
    // App
    appName: 'عبادة ٣٦٥',
    appSubtitle: 'التقويم الإسلامي والتذكيرات',
    
    // Navigation
    calendar: 'التقويم',
    events: 'الأحداث',
    settings: 'الإعدادات',
    
    // Calendar
    today: 'اليوم',
    thisMonth: 'هذا الشهر',
    nextMonth: 'الشهر القادم',
    
    // Events
    upcomingEvents: 'الأحداث القادمة',
    noEventsToday: 'لا توجد أحداث اليوم',
    noEventsThisMonth: 'لا توجد أحداث هذا الشهر',
    
    // Event Categories
    fasting: 'الصيام',
    prayer: 'الصلاة',
    quran: 'القرآن',
    eid: 'العيد',
    hajj: 'الحج',
    takbeer: 'التكبير',
    adhkar: 'الأذكار',
    ramadanCategory: 'رمضان',
    
    // Settings
    preferences: 'التفضيلات',
    notifications: 'الإشعارات',
    hijriOffset: 'تعديل التاريخ الهجري',
    language: 'اللغة',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    prayerTimes: 'مواقيت الصلاة',
    categories: 'فئات الأحداث',
    reminderTimes: 'أوقات التذكير',
    
    // Actions
    save: 'حفظ',
    cancel: 'إلغاء',
    reset: 'إعادة تعيين',
    enable: 'تفعيل',
    disable: 'إلغاء تفعيل',
    test: 'اختبار',
    
    // Days
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
    
    // Prayer names
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    
    // Months
    muharram: 'محرم',
    safar: 'صفر',
    rabiAlAwwal: 'ربيع الأول',
    rabiAlThani: 'ربيع الثاني',
    jumadaAlAwwal: 'جمادى الأول',
    jumadaAlThani: 'جمادى الثاني',
    rajab: 'رجب',
    shaban: 'شعبان',
    ramadan: 'رمضان',
    shawwal: 'شوال',
    dhulQidah: 'ذو القعدة',
    dhulHijjah: 'ذو الحجة',
  },
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(preferencesManager.getLanguage());
  const [isRTL, setIsRTL] = useState(language === 'ar');

  useEffect(() => {
    const unsubscribe = preferencesManager.addPreferencesListener((preferences) => {
      setLanguage(preferences.language);
      const newIsRTL = preferences.language === 'ar';
      setIsRTL(newIsRTL);
      I18nManager.forceRTL(newIsRTL);
    });

    return unsubscribe;
  }, []);

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = (translations[language] as any)[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  const toggleLanguage = async () => {
    await preferencesManager.toggleLanguage();
  };

  const value: LanguageContextType = {
    language,
    isRTL,
    t,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};