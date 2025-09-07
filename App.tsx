import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TabBar } from './src/components/TabBar';
import { preferencesManager } from './src/utils/preferencesManager';
import { notificationManager } from './src/utils/notificationManager';
import { ibadahEventsCalculator } from './src/utils/ibadahEvents';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize preferences manager
      await preferencesManager.initialize();
      
      // Initialize notification manager
      await notificationManager.initialize();
      
      // Schedule notifications for upcoming events
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // Next 6 months
      
      const events = ibadahEventsCalculator.getAllEventsForRange(today, endDate);
      await notificationManager.scheduleEventNotifications(events);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Continue anyway to avoid blocking the app
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarScreen />;
      case 'events':
        return <EventsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <CalendarScreen />;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingTitle}>ibadah365</Text>
              <Text style={styles.loadingSubtitle}>Islamic Calendar & Reminders</Text>
              <Text style={styles.loadingText}>🌙 Loading...</Text>
            </View>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <View style={styles.container}>
            <StatusBar style="auto" />
            
            {/* Main Content */}
            <View style={styles.content}>
              {renderActiveScreen()}
            </View>
            
            {/* Tab Bar */}
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
          </View>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  loadingSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});