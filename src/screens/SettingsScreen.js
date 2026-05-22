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

import { BottomNavBar, SleepTimerSheet } from '../components';
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
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const timerRef = useRef(null);

  const { isPlaying, togglePlayPause } = useMusicPlayer();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

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
    // Navigation is now handled by the CustomTabBar in AppNavigator
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
    Toast.show({ type: 'success', text1: 'Sleep Timer', text2: `Timer set for ${selectedHour}h ${selectedMinute}m` });
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

          {renderSettingItem({
            icon: 'time-outline',
            IconComponent: Ionicons,
            title: 'Sleep timer',
            value: timerActive ? 'Active' : 'Off',
            onPress: () => setShowSleepTimer(true),
          })}
        </View>

        <SleepTimerSheet
          visible={showSleepTimer}
          onClose={() => setShowSleepTimer(false)}
          timerActive={timerActive}
          selectedHour={selectedHour}
          setSelectedHour={setSelectedHour}
          selectedMinute={selectedMinute}
          setSelectedMinute={setSelectedMinute}
          formatCountdown={formatCountdown}
          onStartTimer={handleStartSleepTimer}
          onCancelTimer={handleCancelTimer}
          hours={hours}
          minutes={minutes}
        />
      </ScrollView>

      {/* Bottom Navigation is now handled by AppNavigator's CustomTabBar */}
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
});

export default SettingsScreen;
