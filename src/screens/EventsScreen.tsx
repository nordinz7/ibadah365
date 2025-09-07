import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ibadahEventsCalculator, IbadahEvent, IbadahCategory } from '../utils/ibadahEvents';
import { hijriCalendar } from '../utils/hijriDate';
import { preferencesManager } from '../utils/preferencesManager';

interface EventSection {
  title: string;
  data: IbadahEvent[];
}

type ViewMode = 'upcoming' | 'thisMonth' | 'category';

export const EventsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const [events, setEvents] = useState<IbadahEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<IbadahCategory | null>(null);

  const eventSections = useMemo(() => {
    return groupEventsByMode(events, viewMode, selectedCategory, t, isRTL);
  }, [events, viewMode, selectedCategory, t, isRTL]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Next 3 months
      
      const upcomingEvents = ibadahEventsCalculator.getAllEventsForRange(today, endDate);
      const preferences = preferencesManager.getPreferences();
      
      // Filter events based on user preferences
      const filteredEvents = upcomingEvents.filter(event => 
        preferences.enabledCategories[event.category]
      );
      
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      fasting: '🌙',
      prayer: '🕌',
      quran: '📖',
      eid: '🎉',
      hajj: '🕋',
      takbeer: '🔊',
      adhkar: '📿',
      ramadan: '🌙',
    };
    return icons[category] || '📅';
  };

  const getEventColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      fasting: theme.colors.primary,
      prayer: theme.colors.accent,
      quran: theme.colors.secondary,
      eid: '#E91E63',
      hajj: '#9C27B0',
      takbeer: '#FF9800',
      adhkar: '#607D8B',
      ramadan: theme.colors.primary,
    };
    return colors[category] || theme.colors.primary;
  };

  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    
    return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDaysUntil = (daysUntil: number): string => {
    if (daysUntil === 0) return t('today');
    if (daysUntil === 1) return isRTL ? 'غداً' : 'Tomorrow';
    if (daysUntil > 1) return isRTL ? `خلال ${daysUntil} أيام` : `In ${daysUntil} days`;
    if (daysUntil === -1) return isRTL ? 'أمس' : 'Yesterday';
    return isRTL ? `منذ ${Math.abs(daysUntil)} أيام` : `${Math.abs(daysUntil)} days ago`;
  };

  const renderEventItem = ({ item: event }: { item: IbadahEvent }) => {
    const daysUntil = getDaysUntil(event.date);
    const hijriDate = hijriCalendar.gregorianToHijri(event.date);
    
    return (
      <TouchableOpacity
        style={[
          styles.eventCard,
          {
            backgroundColor: theme.colors.background,
            borderLeftColor: getEventColor(event.category),
          },
        ]}
        onPress={() => {
          // Handle event press - could show details modal
        }}
      >
        <View style={styles.eventHeader}>
          <Text style={[styles.eventIcon, { fontSize: theme.fontSize.xl }]}>
            {getCategoryIcon(event.category)}
          </Text>
          
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
              {isRTL ? event.titleArabic : event.title}
            </Text>
            
            <Text style={[styles.eventDescription, { color: theme.colors.textSecondary }]}>
              {isRTL ? event.descriptionArabic : event.description}
            </Text>
            
            <View style={styles.eventMeta}>
              <Text style={[styles.eventDate, { color: theme.colors.textSecondary }]}>
                {event.date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
              </Text>
              
              <Text style={[styles.hijriDate, { color: theme.colors.textSecondary }]}>
                {hijriDate.hijriDay} {hijriCalendar.getHijriMonthName(hijriDate.hijriMonth, isRTL)} {hijriDate.hijriYear}
              </Text>
            </View>
            
            {daysUntil >= 0 && daysUntil <= 7 && (
              <View style={[styles.countdownBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.countdownText, { color: theme.colors.primary }]}>
                  {formatDaysUntil(daysUntil)}
                </Text>
              </View>
            )}
            
            {event.isMultiDay && event.endDate && (
              <Text style={[styles.eventDuration, { color: theme.colors.textSecondary }]}>
                {isRTL ? 'حتى' : 'Until'} {new Date(event.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
              </Text>
            )}
            
            {event.isForbiddenDay && (
              <View style={[styles.warningBadge, { backgroundColor: theme.colors.error + '20' }]}>
                <Text style={[styles.warningText, { color: theme.colors.error }]}>
                  {isRTL ? 'يحرم الصوم' : 'Fasting Forbidden'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: EventSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* View Mode Selector */}
      <View style={[styles.viewModeSelector, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'upcoming' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setViewMode('upcoming')}
          >
            <Text
              style={[
                styles.viewModeText,
                { color: viewMode === 'upcoming' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {t('upcomingEvents')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'thisMonth' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setViewMode('thisMonth')}
          >
            <Text
              style={[
                styles.viewModeText,
                { color: viewMode === 'thisMonth' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {t('thisMonth')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'category' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setViewMode('category')}
          >
            <Text
              style={[
                styles.viewModeText,
                { color: viewMode === 'category' ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {t('categories')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Category Filter (only shown when category mode is selected) */}
      {viewMode === 'category' && (
        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === null && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: selectedCategory === null ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {isRTL ? 'الكل' : 'All'}
              </Text>
            </TouchableOpacity>
            
            {Object.values(IbadahCategory).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: selectedCategory === category ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {t(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Events List */}
      {eventSections.length > 0 ? (
        <SectionList
          sections={eventSections}
          renderItem={renderEventItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.emptyContainer}
        >
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {viewMode === 'thisMonth' ? t('noEventsThisMonth') : t('noEventsToday')}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

function groupEventsByMode(
  events: IbadahEvent[],
  mode: ViewMode,
  selectedCategory: IbadahCategory | null,
  t: (key: string) => string,
  isRTL: boolean
): EventSection[] {
  let filteredEvents = [...events];
  
  if (mode === 'category' && selectedCategory) {
    filteredEvents = events.filter(event => event.category === selectedCategory);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (mode) {
    case 'upcoming': {
      const upcomingEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });
      
      const groupedByWeek = new Map<string, IbadahEvent[]>();
      
      upcomingEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let groupKey: string;
        if (daysUntil === 0) {
          groupKey = t('today');
        } else if (daysUntil <= 7) {
          groupKey = isRTL ? 'هذا الأسبوع' : 'This Week';
        } else if (daysUntil <= 30) {
          groupKey = isRTL ? 'هذا الشهر' : 'This Month';
        } else {
          groupKey = isRTL ? 'قريباً' : 'Later';
        }
        
        if (!groupedByWeek.has(groupKey)) {
          groupedByWeek.set(groupKey, []);
        }
        groupedByWeek.get(groupKey)!.push(event);
      });
      
      return Array.from(groupedByWeek.entries()).map(([title, data]) => ({
        title,
        data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }));
    }
    
    case 'thisMonth': {
      const thisMonthEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
      });
      
      const groupedByWeek = new Map<string, IbadahEvent[]>();
      
      thisMonthEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const weekStart = new Date(eventDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const weekKey = `${isRTL ? 'أسبوع' : 'Week of'} ${weekStart.getDate()} ${weekStart.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short' })}`;
        
        if (!groupedByWeek.has(weekKey)) {
          groupedByWeek.set(weekKey, []);
        }
        groupedByWeek.get(weekKey)!.push(event);
      });
      
      return Array.from(groupedByWeek.entries()).map(([title, data]) => ({
        title,
        data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }));
    }
    
    case 'category': {
      const groupedByCategory = new Map<string, IbadahEvent[]>();
      
      filteredEvents.forEach(event => {
        const categoryTitle = t(event.category);
        
        if (!groupedByCategory.has(categoryTitle)) {
          groupedByCategory.set(categoryTitle, []);
        }
        groupedByCategory.get(categoryTitle)!.push(event);
      });
      
      return Array.from(groupedByCategory.entries()).map(([title, data]) => ({
        title,
        data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }));
    }
    
    default:
      return [];
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewModeSelector: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryFilter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIcon: {
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
  },
  hijriDate: {
    fontSize: 14,
  },
  countdownBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDuration: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  warningBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});