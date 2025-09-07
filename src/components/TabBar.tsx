import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const tabs = [
    { key: 'calendar', title: t('calendar'), icon: '📅' },
    { key: 'events', title: t('events'), icon: '📋' },
    { key: 'settings', title: t('settings'), icon: '⚙️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { backgroundColor: theme.colors.primary + '20' },
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            <Text style={[styles.tabIcon, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.tabTitle,
                {
                  color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 20, // Extra padding for iOS safe area
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});