export interface IbadahEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  hijriDate: string;
  category: EventCategory;
  isMultiDay?: boolean;
  endDate?: Date;
  reminderTimes?: string[];
  icon?: string;
}

export type EventCategory = 
  | 'sunnah-fast'
  | 'special-fast'
  | 'ramadan'
  | 'eid'
  | 'hajj'
  | 'prayer'
  | 'adhkar'
  | 'forbidden-fast'
  | 'takbeer';

export interface UserSettings {
  hijriOffset: number;
  enabledCategories: EventCategory[];
  reminderTimes: {
    [key in EventCategory]?: string[];
  };
  language: 'en' | 'ar';
  darkMode: boolean;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}