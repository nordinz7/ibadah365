import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, DEFAULT_PREFERENCES, AppTheme, LIGHT_THEME, DARK_THEME } from '../types/preferences';
import { hijriCalendar } from './hijriDate';

const PREFERENCES_KEY = 'ibadah365_preferences';

export class PreferencesManager {
  private preferences: UserPreferences = DEFAULT_PREFERENCES;
  private listeners: Array<(preferences: UserPreferences) => void> = [];

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserPreferences;
        this.preferences = { ...DEFAULT_PREFERENCES, ...parsed };
      }
      
      // Apply hijri offset to calendar
      hijriCalendar.setOffset(this.preferences.hijriOffset);
      
    } catch (error) {
      console.error('Failed to load preferences:', error);
      this.preferences = DEFAULT_PREFERENCES;
    }
  }

  async savePreferences(newPreferences: Partial<UserPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences));
      
      // Update hijri calendar offset if changed
      if (newPreferences.hijriOffset !== undefined) {
        hijriCalendar.setOffset(newPreferences.hijriOffset);
      }
      
      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  getTheme(): AppTheme {
    return this.preferences.theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  }

  getLanguage(): 'en' | 'ar' {
    return this.preferences.language;
  }

  getHijriOffset(): number {
    return this.preferences.hijriOffset;
  }

  async setHijriOffset(offset: number): Promise<void> {
    await this.savePreferences({ hijriOffset: offset });
  }

  async toggleTheme(): Promise<void> {
    const newTheme = this.preferences.theme === 'light' ? 'dark' : 'light';
    await this.savePreferences({ theme: newTheme });
  }

  async toggleLanguage(): Promise<void> {
    const newLanguage = this.preferences.language === 'en' ? 'ar' : 'en';
    await this.savePreferences({ language: newLanguage });
  }

  async updateNotificationSettings(settings: Partial<UserPreferences['notifications']>): Promise<void> {
    const newNotifications = { ...this.preferences.notifications, ...settings };
    await this.savePreferences({ notifications: newNotifications });
  }

  async toggleCategoryEnabled(category: keyof UserPreferences['enabledCategories'], enabled: boolean): Promise<void> {
    const newEnabledCategories = { ...this.preferences.enabledCategories, [category]: enabled };
    await this.savePreferences({ enabledCategories: newEnabledCategories });
  }

  async updatePrayerTimes(prayerTimes: Partial<UserPreferences['prayerTimes']>): Promise<void> {
    const newPrayerTimes = { ...this.preferences.prayerTimes, ...prayerTimes };
    await this.savePreferences({ prayerTimes: newPrayerTimes });
  }

  isCategoryEnabled(category: keyof UserPreferences['enabledCategories']): boolean {
    return this.preferences.enabledCategories[category];
  }

  isNotificationEnabled(category: keyof UserPreferences['notifications']['categories']): boolean {
    return this.preferences.notifications.enabled && this.preferences.notifications.categories[category];
  }

  addPreferencesListener(listener: (preferences: UserPreferences) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.preferences));
  }

  async resetToDefaults(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
      this.preferences = { ...DEFAULT_PREFERENCES };
      hijriCalendar.setOffset(0);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    }
  }

  async exportPreferences(): Promise<string> {
    return JSON.stringify(this.preferences, null, 2);
  }

  async importPreferences(preferencesJson: string): Promise<void> {
    try {
      const imported = JSON.parse(preferencesJson) as UserPreferences;
      await this.savePreferences(imported);
    } catch (error) {
      console.error('Failed to import preferences:', error);
      throw new Error('Invalid preferences format');
    }
  }
}

export const preferencesManager = new PreferencesManager();