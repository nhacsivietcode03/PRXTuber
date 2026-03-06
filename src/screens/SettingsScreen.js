// SettingsScreen - App settings (matching Figma design)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { BottomNavBar } from '../components';
import colors from '../theme/colors';
import { useMusicPlayer } from '../context';

const SettingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [streamQuality, setStreamQuality] = useState('Normal');
  const [lightMode, setLightMode] = useState(false);
  const [selectedHour, setSelectedHour] = useState(6);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef(null);

  const { isPlaying, togglePlayPause } = useMusicPlayer();

  const hours = [4, 5, 6, 7, 8];
  const minutes = [58, 59, 0, 1, 2];

  // Countdown effect
  useEffect(() => {
    if (timerActive && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            Toast.show({ type: 'info', text1: 'Sleep Timer', text2: 'Timer finished. Music stopped.' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  // Stop music when timer finishes
  useEffect(() => {
    if (!timerActive && remainingSeconds === 0 && timerRef.current === null) return;
    if (!timerActive && remainingSeconds === 0 && isPlaying) {
      togglePlayPause();
    }
  }, [timerActive, remainingSeconds]);

  const formatCountdown = () => {
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigation.navigate('Home');
    } else if (tabId === 'discover') {
      navigation.navigate('Discover');
    } else if (tabId === 'favorites') {
      navigation.navigate('Favorites');
    } else if (tabId === 'search') {
      navigation.navigate('Search');
    }
  };

  const handleStreamQuality = () => {
    Alert.alert(
      'Stream Quality',
      'Select streaming quality:',
      [
        { text: 'Low', onPress: () => setStreamQuality('Low') },
        { text: 'Normal', onPress: () => setStreamQuality('Normal') },
        { text: 'High', onPress: () => setStreamQuality('High') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLightMode = () => {
    setLightMode(!lightMode);
    Alert.alert('Theme', lightMode ? 'Dark mode enabled' : 'Light mode is not available yet');
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate PRX Tuber',
      'Thank you for using our app! Would you like to rate us?',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => Linking.openURL('https://play.google.com/store') },
      ]
    );
  };

  const handleContactUs = () => {
    Alert.alert(
      'Contact Us',
      'Email: support@prxtuber.com\n\nWe typically respond within 24 hours.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://www.jamendo.com/legal/privacy');
  };

  const handleStartSleepTimer = () => {
    const totalSeconds = (selectedHour * 60 + selectedMinute) * 60;
    if (totalSeconds <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Time', text2: 'Please select a valid time.' });
      return;
    }
    setRemainingSeconds(totalSeconds);
    setTimerActive(true);
  };

  const handleCancelTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerActive(false);
    setRemainingSeconds(0);
  };

  const renderSettingItem = ({ icon, IconComponent = Ionicons, title, value, onPress }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <IconComponent name={icon} size={20} color={colors.textPrimary} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {value && (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const renderTimePickerItem = (value, isSelected, onPress, isHour = true) => (
    <TouchableOpacity
      style={[styles.timeItem, isSelected && styles.timeItemSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
        {isHour ? `${value.toString().padStart(2, '0')} h` : `${value.toString().padStart(2, '0')} m`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Setting</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Settings Items */}
        <View style={styles.settingsContainer}>
          {renderSettingItem({
            icon: 'play',
            IconComponent: Ionicons,
            title: 'Stream quality',
            value: streamQuality,
            onPress: handleStreamQuality,
          })}

          {renderSettingItem({
            icon: 'sunny-outline',
            IconComponent: Ionicons,
            title: 'Light mode',
            value: lightMode ? 'On' : 'Off',
            onPress: handleLightMode,
          })}

          {renderSettingItem({
            icon: 'star',
            IconComponent: Ionicons,
            title: 'Rate this app',
            onPress: handleRateApp,
          })}

          {renderSettingItem({
            icon: 'mail',
            IconComponent: Ionicons,
            title: 'Contact us',
            onPress: handleContactUs,
          })}

          {renderSettingItem({
            icon: 'information-circle',
            IconComponent: Ionicons,
            title: 'Privacy policy',
            onPress: handlePrivacyPolicy,
          })}
        </View>

        {/* Sleep Timer Section */}
        <View style={styles.sleepTimerContainer}>
          <View style={styles.sleepTimerHeader}>
            <Ionicons name="time-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.sleepTimerTitle}>Sleep timer</Text>
          </View>

          {timerActive ? (
            /* Countdown View */
            <View style={styles.countdownContainer}>
              <View style={styles.countdownDisplay}>
                <Text style={styles.countdownText}>{formatCountdown()}</Text>
                <Text style={styles.countdownLabel}>remaining</Text>
              </View>

              <TouchableOpacity
                style={styles.cancelTimerButton}
                onPress={handleCancelTimer}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelTimerText}>Cancel timer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Time Picker View */
            <>
              <View style={styles.timePickerContainer}>
                {/* Hours Column */}
                <View style={styles.timeColumn}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={`hour-${hour}`}
                      style={[
                        styles.timeItem,
                        selectedHour === hour && styles.timeItemSelectedHour,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.timeText,
                        selectedHour === hour && styles.timeTextSelected,
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Selected Time Display */}
                <View style={styles.selectedTimeContainer}>
                  <View style={styles.selectedTimeBox}>
                    <Text style={styles.selectedTimeText}>
                      {selectedHour.toString().padStart(2, '0')} h
                    </Text>
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.selectedTimeBox}>
                    <Text style={styles.selectedTimeText}>
                      {selectedMinute.toString().padStart(2, '0')} m
                    </Text>
                  </View>
                </View>

                {/* Minutes Column */}
                <View style={styles.timeColumn}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={`minute-${minute}`}
                      style={[
                        styles.timeItem,
                        selectedMinute === minute && styles.timeItemSelectedMinute,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={[
                        styles.timeText,
                        selectedMinute === minute && styles.timeTextSelected,
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Start Button */}
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartSleepTimer}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  settingsContainer: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '400',
  },
  settingValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  // Sleep Timer Styles
  sleepTimerContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sleepTimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  sleepTimerTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timeItemSelectedHour: {
    // Selected state handled by selectedTimeContainer
  },
  timeItemSelectedMinute: {
    // Selected state handled by selectedTimeContainer
  },
  timeText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  timeTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  selectedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedTimeBox: {
    paddingHorizontal: 8,
  },
  selectedTimeText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignSelf: 'center',
    marginTop: 24,
  },
  startButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  // Countdown styles
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  countdownDisplay: {
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 40,
    marginBottom: 24,
    width: '100%',
  },
  countdownText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  countdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  cancelTimerButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  cancelTimerText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default SettingsScreen;
