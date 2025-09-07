import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ibadahEventsCalculator, IbadahEvent } from "../utils/ibadahEvents";
import { hijriCalendar, HijriDateInfo } from "../utils/hijriDate";
import { preferencesManager } from "../utils/preferencesManager";

const { width } = Dimensions.get("window");
const CALENDAR_WIDTH = width - 32;
const DAY_SIZE = CALENDAR_WIDTH / 7;

interface CalendarDay {
  date: Date;
  hijriDate: HijriDateInfo;
  events: IbadahEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export const CalendarScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<IbadahEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentDate, events);
  }, [currentDate, events]);

  const selectedDayEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.toDateString() === selectedDate.toDateString() ||
        (event.isMultiDay &&
          event.endDate &&
          selectedDate >= new Date(event.date) &&
          selectedDate <= new Date(event.endDate))
      );
    });
  }, [selectedDate, events]);

  const currentHijriDate = useMemo(() => {
    return hijriCalendar.gregorianToHijri(currentDate);
  }, [currentDate]);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const monthEvents = ibadahEventsCalculator.getAllEventsForRange(
        startOfMonth,
        endOfMonth
      );
      const preferences = preferencesManager.getPreferences();

      // Filter events based on user preferences
      const filteredEvents = monthEvents.filter(
        (event) => preferences.enabledCategories[event.category]
      );

      setEvents(filteredEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const selectDate = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      fasting: "🌙",
      prayer: "🕌",
      quran: "📖",
      eid: "🎉",
      hajj: "🕋",
      takbeer: "🔊",
      adhkar: "📿",
      ramadan: "🌙",
    };
    return icons[category] || "📅";
  };

  const getEventColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      fasting: theme.colors.primary,
      prayer: theme.colors.accent,
      quran: theme.colors.secondary,
      eid: "#E91E63",
      hajj: "#9C27B0",
      takbeer: "#FF9800",
      adhkar: "#607D8B",
      ramadan: theme.colors.primary,
    };
    return colors[category] || theme.colors.primary;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={() => navigateMonth("prev")}
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[styles.navButtonText, { color: theme.colors.text }]}
              >
                {isRTL ? "›" : "‹"}
              </Text>
            </TouchableOpacity>

            <View style={styles.monthInfo}>
              <Text style={[styles.monthText, { color: theme.colors.text }]}>
                {currentDate.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </Text>
              <Text
                style={[
                  styles.hijriText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {hijriCalendar.getHijriMonthName(
                  currentHijriDate.hijriMonth,
                  isRTL
                )}{" "}
                {currentHijriDate.hijriYear}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigateMonth("next")}
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[styles.navButtonText, { color: theme.colors.text }]}
              >
                {isRTL ? "‹" : "›"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={navigateToToday}
            style={[
              styles.todayButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={[styles.todayButtonText, { color: "#FFFFFF" }]}>
              {t("today")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
              <View key={day} style={[styles.dayHeader, { width: DAY_SIZE }]}>
                <Text
                  style={[
                    styles.dayHeaderText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t(
                    day === "sun"
                      ? "sunday"
                      : day === "mon"
                      ? "monday"
                      : day === "tue"
                      ? "tuesday"
                      : day === "wed"
                      ? "wednesday"
                      : day === "thu"
                      ? "thursday"
                      : day === "fri"
                      ? "friday"
                      : "saturday"
                  ).slice(0, 3)}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  { width: DAY_SIZE, height: DAY_SIZE },
                  day.isSelected && {
                    backgroundColor: theme.colors.primary + "20",
                  },
                  day.isToday && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => selectDate(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: day.isCurrentMonth
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    },
                    day.isToday && {
                      color: theme.colors.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {day.date.getDate()}
                </Text>

                {day.events.length > 0 && (
                  <View style={styles.eventIndicators}>
                    {day.events.slice(0, 3).map((event, eventIndex) => (
                      <View
                        key={eventIndex}
                        style={[
                          styles.eventDot,
                          { backgroundColor: getEventColor(event.category) },
                        ]}
                      />
                    ))}
                    {day.events.length > 3 && (
                      <Text
                        style={[
                          styles.moreEventsText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        +{day.events.length - 3}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Day Events */}
        <View
          style={[
            styles.eventsSection,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            style={[styles.eventsSectionTitle, { color: theme.colors.text }]}
          >
            {selectedDate.toDateString() === new Date().toDateString()
              ? t("today")
              : selectedDate.toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
          </Text>

          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((event) => (
              <View
                key={event.id}
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: theme.colors.background,
                    borderLeftColor: getEventColor(event.category),
                  },
                ]}
              >
                <View style={styles.eventHeader}>
                  <Text
                    style={[styles.eventIcon, { fontSize: theme.fontSize.lg }]}
                  >
                    {getCategoryIcon(event.category)}
                  </Text>
                  <View style={styles.eventInfo}>
                    <Text
                      style={[styles.eventTitle, { color: theme.colors.text }]}
                    >
                      {isRTL ? event.titleArabic : event.title}
                    </Text>
                    <Text
                      style={[
                        styles.eventDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {isRTL ? event.descriptionArabic : event.description}
                    </Text>
                  </View>
                </View>

                {event.isMultiDay && event.endDate && (
                  <Text
                    style={[
                      styles.eventDuration,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {new Date(event.date).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text
              style={[
                styles.noEventsText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t("noEventsToday")}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function generateCalendarDays(
  currentDate: Date,
  events: IbadahEvent[]
): CalendarDay[] {
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());

  const endOfCalendar = new Date(endOfMonth);
  endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfMonth.getDay()));

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (
    let date = new Date(startOfCalendar);
    date <= endOfCalendar;
    date.setDate(date.getDate() + 1)
  ) {
    const currentDay = new Date(date);
    currentDay.setHours(0, 0, 0, 0);

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      return (
        eventDate.getTime() === currentDay.getTime() ||
        (event.isMultiDay &&
          event.endDate &&
          currentDay >= new Date(event.date) &&
          currentDay <= new Date(event.endDate))
      );
    });

    days.push({
      date: new Date(currentDay),
      hijriDate: hijriCalendar.gregorianToHijri(currentDay),
      events: dayEvents,
      isCurrentMonth: currentDay.getMonth() === currentDate.getMonth(),
      isToday: currentDay.getTime() === today.getTime(),
      isSelected: false, // Will be set by parent component
    });
  }

  return days;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  monthInfo: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  hijriText: {
    fontSize: 14,
    marginTop: 2,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  calendar: {
    padding: 16,
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
  },
  eventIndicators: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  moreEventsText: {
    fontSize: 8,
    marginLeft: 2,
  },
  eventsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  eventCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  eventIcon: {
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  eventDuration: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  noEventsText: {
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
    paddingVertical: 24,
  },
});
