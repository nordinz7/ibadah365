import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { preferencesManager } from '../utils/preferencesManager';
import { notificationManager } from '../utils/notificationManager';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/preferences';
import { IbadahCategory } from '../utils/ibadahEvents';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {children}
    </View>
  );
};

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  subtitle,
  rightComponent,
  onPress,
  showBorder = true,
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.settingsRow,
        showBorder && { borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsRowLeft}>
        <Text style={[styles.settingsRowTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingsRowSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent && <View style={styles.settingsRowRight}>{rightComponent}</View>}
    </TouchableOpacity>
  );
};

export const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, toggleLanguage, language, isRTL } = useLanguage();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hijriOffsetModalVisible, setHijriOffsetModalVisible] = useState(false);
  const [tempHijriOffset, setTempHijriOffset] = useState('0');
  const [prayerTimesModalVisible, setPrayerTimesModalVisible] = useState(false);
  const [tempPrayerTimes, setTempPrayerTimes] = useState(DEFAULT_PREFERENCES.prayerTimes);

  useEffect(() => {
    loadPreferences();
    
    const unsubscribe = preferencesManager.addPreferencesListener((newPreferences) => {
      setPreferences(newPreferences);
    });
    
    return unsubscribe;
  }, []);

  const loadPreferences = async () => {
    const currentPreferences = preferencesManager.getPreferences();
    setPreferences(currentPreferences);
    setTempHijriOffset(currentPreferences.hijriOffset.toString());
    setTempPrayerTimes(currentPreferences.prayerTimes);
  };

  const toggleNotifications = async (enabled: boolean) => {
    await preferencesManager.updateNotificationSettings({ enabled });
  };

  const toggleCategoryNotification = async (category: IbadahCategory, enabled: boolean) => {
    const newCategories = { ...preferences.notifications.categories, [category]: enabled };
    await preferencesManager.updateNotificationSettings({ categories: newCategories });
  };

  const toggleCategoryEnabled = async (category: IbadahCategory, enabled: boolean) => {
    await preferencesManager.toggleCategoryEnabled(category, enabled);
  };

  const showHijriOffsetModal = () => {
    setTempHijriOffset(preferences.hijriOffset.toString());
    setHijriOffsetModalVisible(true);
  };

  const saveHijriOffset = async () => {
    const offset = parseInt(tempHijriOffset) || 0;
    if (offset < -2 || offset > 2) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'يجب أن يكون التعديل بين -2 و +2 أيام' : 'Offset must be between -2 and +2 days'
      );
      return;
    }
    
    await preferencesManager.setHijriOffset(offset);
    setHijriOffsetModalVisible(false);
  };

  const showPrayerTimesModal = () => {
    setTempPrayerTimes(preferences.prayerTimes);
    setPrayerTimesModalVisible(true);
  };

  const savePrayerTimes = async () => {
    await preferencesManager.updatePrayerTimes(tempPrayerTimes);
    setPrayerTimesModalVisible(false);
  };

  const testNotifications = async () => {
    try {
      await notificationManager.testNotification();
      Alert.alert(
        isRTL ? 'اختبار الإشعارات' : 'Notification Test',
        isRTL ? 'سيتم إرسال إشعار تجريبي خلال 5 ثواني' : 'A test notification will be sent in 5 seconds'
      );
    } catch (error) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'فشل في إرسال الإشعار التجريبي' : 'Failed to send test notification'
      );
    }
  };

  const resetSettings = () => {
    Alert.alert(
      isRTL ? 'إعادة تعيين الإعدادات' : 'Reset Settings',
      isRTL ? 'هل تريد إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟' : 'Are you sure you want to reset all settings to default values?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'إعادة تعيين' : 'Reset',
          style: 'destructive',
          onPress: async () => {
            await preferencesManager.resetToDefaults();
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: IbadahCategory): string => {
    const icons = {
      [IbadahCategory.FASTING]: '🌙',
      [IbadahCategory.PRAYER]: '🕌',
      [IbadahCategory.QURAN]: '📖',
      [IbadahCategory.EID]: '🎉',
      [IbadahCategory.HAJJ]: '🕋',
      [IbadahCategory.TAKBEER]: '🔊',
      [IbadahCategory.ADHKAR]: '📿',
      [IbadahCategory.RAMADAN]: '🌙',
    };
    return icons[category] || '📅';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Basic Settings */}
        <SettingsSection title={t('preferences')}>
          <SettingsRow
            title={t('language')}
            subtitle={language === 'ar' ? 'العربية' : 'English'}
            rightComponent={
              <TouchableOpacity
                style={[styles.toggleButton, { backgroundColor: theme.colors.primary }]}
                onPress={toggleLanguage}
              >
                <Text style={styles.toggleButtonText}>
                  {language === 'ar' ? 'En' : 'ع'}
                </Text>
              </TouchableOpacity>
            }
          />
          
          <SettingsRow
            title={t('theme')}
            subtitle={isDark ? t('dark') : t('light')}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsRow
            title={t('hijriOffset')}
            subtitle={`${preferences.hijriOffset >= 0 ? '+' : ''}${preferences.hijriOffset} ${isRTL ? 'أيام' : 'days'}`}
            onPress={showHijriOffsetModal}
            showBorder={false}
          />
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection title={t('notifications')}>
          <SettingsRow
            title={t('notifications')}
            subtitle={preferences.notifications.enabled ? t('enable') : t('disable')}
            rightComponent={
              <Switch
                value={preferences.notifications.enabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingsRow
            title={isRTL ? 'اختبار الإشعارات' : 'Test Notifications'}
            onPress={testNotifications}
          />
          
          <SettingsRow
            title={t('prayerTimes')}
            subtitle={isRTL ? 'تخصيص مواقيت الصلاة' : 'Customize prayer times'}
            onPress={showPrayerTimesModal}
            showBorder={false}
          />
        </SettingsSection>

        {/* Event Categories */}
        <SettingsSection title={t('categories')}>
          {Object.values(IbadahCategory).map((category, index) => (
            <SettingsRow
              key={category}
              title={`${getCategoryIcon(category)} ${t(category)}`}
              rightComponent={
                <View style={styles.categoryControls}>
                  <Text style={[styles.categoryLabel, { color: theme.colors.textSecondary }]}>
                    {isRTL ? 'إشعار' : 'Notify'}
                  </Text>
                  <Switch
                    value={preferences.notifications.categories[category]}
                    onValueChange={(value) => toggleCategoryNotification(category, value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor="#FFFFFF"
                    style={styles.categorySwitch}
                  />
                  <Text style={[styles.categoryLabel, { color: theme.colors.textSecondary }]}>
                    {isRTL ? 'عرض' : 'Show'}
                  </Text>
                  <Switch
                    value={preferences.enabledCategories[category]}
                    onValueChange={(value) => toggleCategoryEnabled(category, value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              }
              showBorder={index < Object.values(IbadahCategory).length - 1}
            />
          ))}
        </SettingsSection>

        {/* Actions */}
        <SettingsSection title={isRTL ? 'إجراءات' : 'Actions'}>
          <SettingsRow
            title={t('reset')}
            subtitle={isRTL ? 'إعادة تعيين جميع الإعدادات' : 'Reset all settings to defaults'}
            onPress={resetSettings}
            showBorder={false}
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            ibadah365 v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Hijri Offset Modal */}
      <Modal
        visible={hijriOffsetModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setHijriOffsetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('hijriOffset')}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              {isRTL 
                ? 'اضبط التاريخ الهجري حسب رؤية الهلال المحلية'
                : 'Adjust Hijri date based on local moon sighting'}
            </Text>
            
            <View style={styles.offsetContainer}>
              <TouchableOpacity
                style={[styles.offsetButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => setTempHijriOffset((parseInt(tempHijriOffset) - 1).toString())}
              >
                <Text style={[styles.offsetButtonText, { color: theme.colors.text }]}>-</Text>
              </TouchableOpacity>
              
              <TextInput
                style={[
                  styles.offsetInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={tempHijriOffset}
                onChangeText={setTempHijriOffset}
                keyboardType="numeric"
                textAlign="center"
              />
              
              <TouchableOpacity
                style={[styles.offsetButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => setTempHijriOffset((parseInt(tempHijriOffset) + 1).toString())}
              >
                <Text style={[styles.offsetButtonText, { color: theme.colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => setHijriOffsetModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={saveHijriOffset}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prayer Times Modal */}
      <Modal
        visible={prayerTimesModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPrayerTimesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('prayerTimes')}
            </Text>
            
            <ScrollView style={styles.prayerTimesContainer}>
              {Object.entries(tempPrayerTimes).map(([prayer, time]) => (
                <View key={prayer} style={styles.prayerTimeRow}>
                  <Text style={[styles.prayerName, { color: theme.colors.text }]}>
                    {t(prayer)}
                  </Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={time}
                    onChangeText={(text) =>
                      setTempPrayerTimes({ ...tempPrayerTimes, [prayer]: text })
                    }
                    placeholder="HH:MM"
                    keyboardType="numeric"
                  />
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => setPrayerTimesModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={savePrayerTimes}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsRowLeft: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsRowSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingsRowRight: {
    marginLeft: 12,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  categorySwitch: {
    marginHorizontal: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  offsetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  offsetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offsetButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  offsetInput: {
    width: 80,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  prayerTimesContainer: {
    maxHeight: 200,
    marginBottom: 24,
  },
  prayerTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  timeInput: {
    width: 80,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});