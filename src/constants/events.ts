import { EventCategory } from '../types';

export const EVENT_CATEGORIES: Record<EventCategory, { name: string; icon: string; color: string }> = {
  'sunnah-fast': {
    name: 'Sunnah Fasting',
    icon: '🌙',
    color: '#4A90E2'
  },
  'special-fast': {
    name: 'Special Fasting',
    icon: '🌟',
    color: '#7B68EE'
  },
  'ramadan': {
    name: 'Ramadan',
    icon: '🌙',
    color: '#FF6B6B'
  },
  'eid': {
    name: 'Eid',
    icon: '🎉',
    color: '#4ECDC4'
  },
  'hajj': {
    name: 'Hajj Season',
    icon: '🕋',
    color: '#45B7D1'
  },
  'prayer': {
    name: 'Prayer',
    icon: '🕌',
    color: '#96CEB4'
  },
  'adhkar': {
    name: 'Adhkar',
    icon: '📖',
    color: '#FFEAA7'
  },
  'forbidden-fast': {
    name: 'Forbidden Fasting',
    icon: '🚫',
    color: '#FF7675'
  },
  'takbeer': {
    name: 'Takbeer Tashreeq',
    icon: '🔊',
    color: '#A29BFE'
  }
};

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi\' al-Awwal',
  'Rabi\' al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhul-Qi\'dah',
  'Dhul-Hijjah'
];