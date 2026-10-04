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
import Constants from 'expo-constants';

import { BottomNavBar, SleepTimerSheet } from '../components';
import colors from '../theme/colors';
import { useMusicPlayer } from '../context';
import { logger } from '../utils/logger';
import { HotUpdater } from '@hot-updater/react-native';
import { HOT_UPDATER_CONFIG } from '../config/hotUpdater';

const SettingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [streamQuality, setStreamQuality] = useState('Normal');

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString() || '23';
  const [lightMode, setLightMode] = useState(false);
  const [selectedHour, setSelectedHour] = useState(6);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [otaBundleId, setOtaBundleId] = useState(null);
  const timerRef = useRef(null);

  const { isPlaying, togglePlayPause } = useMusicPlayer();

  useEffect(() => {
    try {
      const bId = HotUpdater.getBundleId();
      if (bId && bId !== '00000000-0000-0000-0000-000000000000') {
        setOtaBundleId(bId);
      }
    } catch (e) {
      // Ignore in non-native environments
    }
  }, []);

  const handleCheckUpdate = async () => {
    if (isCheckingUpdate) return;
    setIsCheckingUpdate(true);
    Toast.show({ type: 'info', text1: 'Hot Update', text2: 'Đang kiểm tra bản cập nhật...' });
    try {
      const updateInfo = await HotUpdater.checkForUpdate({
        baseURL: HOT_UPDATER_CONFIG.baseURL,
        updateStrategy: HOT_UPDATER_CONFIG.updateStrategy,
      });

      if (updateInfo) {
        Alert.alert(
          'Có bản cập nhật mới',
          `Đã tìm thấy bản cập nhật mới!\n\nNội dung: ${updateInfo.message || 'Bản vá cập nhật'}\nBundle ID: ${updateInfo.id.substring(0, 8)}...`,
          [
            { text: 'Để sau', style: 'cancel' },
            {
              text: 'Cập nhật ngay',
              onPress: async () => {
                Toast.show({ type: 'info', text1: 'Đang tải...', text2: 'Đang tải bản cập nhật mới' });
                try {
                  const success = await updateInfo.updateBundle();
                  if (success) {
                    Alert.alert('Cập nhật thành công', 'Khởi động lại ứng dụng ngay để áp dụng?', [
                      { text: 'Để sau', style: 'cancel' },
                      { text: 'Khởi động lại', onPress: () => HotUpdater.reload() },
                    ]);
                  } else {
                    Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải gói cập nhật.' });
                  }
                } catch (e) {
                  Alert.alert('Lỗi tải cập nhật', e.message || String(e));
                }
              },
            },
          ]
        );
      } else {
        Toast.show({ type: 'success', text1: 'Đã cập nhật', text2: 'Bạn đang dùng phiên bản mới nhất!' });
      }
    } catch (err) {
      console.warn('[HotUpdater Check Error]', err);
      Alert.alert('Kiểm tra thất bại', err.message || 'Không thể kết nối đến máy chủ cập nhật.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

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

          {renderSettingItem({
            icon: 'share-social-outline',
            IconComponent: Ionicons,
            title: 'Share Diagnostic Log',
            onPress: () => logger.exportAndShareLogs(),
          })}

          {renderSettingItem({
            icon: 'cloud-download-outline',
            IconComponent: Ionicons,
            title: 'Kiểm tra bản cập nhật',
            value: isCheckingUpdate ? 'Đang kiểm tra...' : (otaBundleId ? `OTA: ${otaBundleId.substring(0, 8)}` : undefined),
            onPress: handleCheckUpdate,
          })}
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 5: {appVersion} - ({buildNumber})</Text>
          {otaBundleId ? (
            <Text style={styles.otaBundleText}>OTA Bundle: {otaBundleId.substring(0, 13)}...</Text>
          ) : null}
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
    flexGrow: 1,
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
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '400',
  },
  otaBundleText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default SettingsScreen;
