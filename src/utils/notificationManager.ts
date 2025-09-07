import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { IbadahEvent } from './ibadahEvents';
import { preferencesManager } from './preferencesManager';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ScheduledNotification {
  id: string;
  eventId: string;
  scheduledTime: Date;
  notificationId: string;
}

export class NotificationManager {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  async initialize(): Promise<void> {
    try {
      await this.requestPermissions();
      await this.setupNotificationCategories();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('ibadah-reminder', [
      {
        identifier: 'view',
        buttonTitle: 'View',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: { isDestructive: true },
      },
    ]);
  }

  async scheduleEventNotifications(events: IbadahEvent[]): Promise<void> {
    const preferences = preferencesManager.getPreferences();
    
    if (!preferences.notifications.enabled) {
      return;
    }

    // Cancel all existing notifications first
    await this.cancelAllNotifications();

    for (const event of events) {
      if (!preferences.notifications.categories[event.category]) {
        continue; // Skip if category is disabled
      }

      await this.scheduleNotificationsForEvent(event, preferences);
    }
  }

  private async scheduleNotificationsForEvent(event: IbadahEvent, preferences: any): Promise<void> {
    const now = new Date();
    const reminderTimes = event.reminderTimes || preferences.notifications.reminderTimes.customTimes;

    // Schedule default reminder (1 hour before or custom time before event)
    const defaultReminderTime = new Date(event.date.getTime() - (preferences.notifications.reminderTimes.beforeEvent * 60 * 1000));
    
    if (defaultReminderTime > now) {
      await this.scheduleNotification({
        title: this.getNotificationTitle(event, preferences.language),
        body: this.getNotificationBody(event, preferences.language),
        data: { eventId: event.id, type: 'reminder' },
        trigger: { date: defaultReminderTime },
        categoryIdentifier: 'ibadah-reminder',
      }, `${event.id}-default`);
    }

    // Schedule custom reminder times
    for (const timeStr of reminderTimes) {
      const reminderTime = this.parseReminderTime(timeStr, event.date, preferences);
      
      if (reminderTime && reminderTime > now) {
        await this.scheduleNotification({
          title: this.getNotificationTitle(event, preferences.language),
          body: this.getNotificationBody(event, preferences.language),
          data: { eventId: event.id, type: 'custom' },
          trigger: { date: reminderTime },
          categoryIdentifier: 'ibadah-reminder',
        }, `${event.id}-${timeStr}`);
      }
    }

    // Handle multi-day events (like Ramadan, I'tikaf)
    if (event.isMultiDay && event.endDate) {
      await this.scheduleMultiDayEventNotifications(event, preferences);
    }

    // Handle special cases like Takbeer Tashreeq (after each Fard prayer)
    if (event.category === 'takbeer' && event.reminderTimes?.includes('after_fard')) {
      await this.schedulePrayerBasedNotifications(event, preferences);
    }
  }

  private async scheduleMultiDayEventNotifications(event: IbadahEvent, preferences: any): Promise<void> {
    if (!event.endDate) return;

    const currentDate = new Date(event.date);
    const endDate = new Date(event.endDate);

    while (currentDate <= endDate) {
      const dailyReminderTime = new Date(currentDate);
      dailyReminderTime.setHours(20, 0, 0, 0); // 8 PM reminder

      if (dailyReminderTime > new Date()) {
        await this.scheduleNotification({
          title: this.getNotificationTitle(event, preferences.language, currentDate),
          body: this.getNotificationBody(event, preferences.language, currentDate),
          data: { eventId: event.id, type: 'daily', date: currentDate.toISOString() },
          trigger: { date: dailyReminderTime },
          categoryIdentifier: 'ibadah-reminder',
        }, `${event.id}-daily-${currentDate.toISOString().split('T')[0]}`);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private async schedulePrayerBasedNotifications(event: IbadahEvent, preferences: any): Promise<void> {
    const prayerTimes = preferences.prayerTimes;
    const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    const currentDate = new Date(event.date);
    const endDate = event.endDate || new Date(event.date);

    while (currentDate <= endDate) {
      for (const prayerName of prayerNames) {
        const prayerTime = this.parsePrayerTime(prayerTimes[prayerName], currentDate);
        if (prayerTime > new Date()) {
          // Schedule 30 minutes after prayer time
          const reminderTime = new Date(prayerTime.getTime() + (30 * 60 * 1000));
          
          await this.scheduleNotification({
            title: preferences.language === 'ar' ? 'تكبير التشريق' : 'Takbeer Tashreeq',
            body: preferences.language === 'ar' 
              ? `وقت التكبير بعد صلاة ${this.getPrayerNameArabic(prayerName)}`
              : `Time for Takbeer after ${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} prayer`,
            data: { eventId: event.id, type: 'takbeer', prayer: prayerName },
            trigger: { date: reminderTime },
            categoryIdentifier: 'ibadah-reminder',
          }, `${event.id}-takbeer-${prayerName}-${currentDate.toISOString().split('T')[0]}`);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private parseReminderTime(timeStr: string, eventDate: Date, preferences: any): Date | null {
    if (timeStr === 'fajr' || timeStr === 'dhuhr' || timeStr === 'asr' || timeStr === 'maghrib' || timeStr === 'isha') {
      return this.parsePrayerTime(preferences.prayerTimes[timeStr], eventDate);
    }

    // Parse time format like '20:00'
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const [, hours, minutes] = timeMatch;
      const reminderDate = new Date(eventDate);
      reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If it's for the same day but time has passed, schedule for previous day
      if (reminderDate >= eventDate) {
        reminderDate.setDate(reminderDate.getDate() - 1);
      }
      
      return reminderDate;
    }

    return null;
  }

  private parsePrayerTime(timeStr: string, date: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerDate = new Date(date);
    prayerDate.setHours(hours, minutes, 0, 0);
    return prayerDate;
  }

  private getPrayerNameArabic(prayerName: string): string {
    const arabicNames: { [key: string]: string } = {
      fajr: 'الفجر',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء',
    };
    return arabicNames[prayerName] || prayerName;
  }

  private getNotificationTitle(event: IbadahEvent, language: 'en' | 'ar', date?: Date): string {
    const title = language === 'ar' ? event.titleArabic : event.title;
    
    if (date && event.isMultiDay) {
      const dayInfo = language === 'ar' ? 'اليوم' : 'Today';
      return `${title} - ${dayInfo}`;
    }
    
    return title;
  }

  private getNotificationBody(event: IbadahEvent, language: 'en' | 'ar', date?: Date): string {
    const body = language === 'ar' ? event.descriptionArabic : event.description;
    
    if (date) {
      const dateStr = date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
      return `${body}\n${dateStr}`;
    }
    
    return body;
  }

  private async scheduleNotification(content: any, uniqueId: string): Promise<void> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data,
          categoryIdentifier: content.categoryIdentifier,
        },
        trigger: { date: content.trigger.date },
      });

      this.scheduledNotifications.set(uniqueId, {
        id: uniqueId,
        eventId: content.data.eventId,
        scheduledTime: content.trigger.date,
        notificationId,
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  async cancelEventNotifications(eventId: string): Promise<void> {
    try {
      const toRemove: string[] = [];
      
      for (const [key, notification] of this.scheduledNotifications.entries()) {
        if (notification.eventId === eventId) {
          await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
          toRemove.push(key);
        }
      }
      
      toRemove.forEach(key => this.scheduledNotifications.delete(key));
    } catch (error) {
      console.error('Failed to cancel event notifications:', error);
    }
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  async testNotification(): Promise<void> {
    const testTime = new Date(Date.now() + 5000); // 5 seconds from now
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification 📱',
        body: 'Ibadah365 notifications are working!',
        data: { test: true },
      },
      trigger: { date: testTime },
    });
  }
}

export const notificationManager = new NotificationManager();