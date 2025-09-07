import { IbadahCategory } from '../utils/ibadahEvents';

export interface NotificationSettings {
  enabled: boolean;
  categories: {
    [key in IbadahCategory]: boolean;
  };
  reminderTimes: {
    beforeEvent: number; // minutes before event
    customTimes: string[]; // custom times like '08:00', 'fajr'
  };
}

export interface UserPreferences {
  hijriOffset: number; // +/- days for local moon sighting
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  calendarView: 'month' | 'list';
  enabledCategories: {
    [key in IbadahCategory]: boolean;
  };
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  hijriOffset: 0,
  language: 'en',
  theme: 'light',
  notifications: {
    enabled: true,
    categories: {
      [IbadahCategory.FASTING]: true,
      [IbadahCategory.PRAYER]: true,
      [IbadahCategory.QURAN]: true,
      [IbadahCategory.EID]: true,
      [IbadahCategory.HAJJ]: true,
      [IbadahCategory.TAKBEER]: true,
      [IbadahCategory.ADHKAR]: true,
      [IbadahCategory.RAMADAN]: true,
    },
    reminderTimes: {
      beforeEvent: 60, // 1 hour before
      customTimes: ['20:00'], // 8 PM default
    },
  },
  calendarView: 'month',
  enabledCategories: {
    [IbadahCategory.FASTING]: true,
    [IbadahCategory.PRAYER]: true,
    [IbadahCategory.QURAN]: true,
    [IbadahCategory.EID]: true,
    [IbadahCategory.HAJJ]: true,
    [IbadahCategory.TAKBEER]: true,
    [IbadahCategory.ADHKAR]: true,
    [IbadahCategory.RAMADAN]: true,
  },
  prayerTimes: {
    fajr: '05:30',
    sunrise: '06:45',
    dhuhr: '12:30',
    asr: '15:30',
    maghrib: '18:15',
    isha: '19:30',
  },
};

export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
    border: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

export const LIGHT_THEME: AppTheme = {
  colors: {
    primary: '#2E7D32',
    secondary: '#FFA726',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    accent: '#4CAF50',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    border: '#E0E0E0',
    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};

export const DARK_THEME: AppTheme = {
  colors: {
    primary: '#4CAF50',
    secondary: '#FFB74D',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#BDBDBD',
    accent: '#66BB6A',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    border: '#333333',
    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};