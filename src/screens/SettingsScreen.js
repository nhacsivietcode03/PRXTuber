// SettingsScreen - App settings and user preferences
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BottomNavBar } from '../components';
import colors from '../theme/colors';

const SettingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('settings');
  
  // Settings state
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleBack = () => {
    navigation.goBack();
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

  const handleAbout = () => {
    Alert.alert(
      'About PRX Tuber',
      'Version 1.0.0\n\nA music streaming app powered by Jamendo API.\n\nBuilt with React Native & Expo.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://www.jamendo.com/legal/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://www.jamendo.com/legal/terms');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Cache cleared successfully!')
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Email: support@prxtuber.com\n\nWe typically respond within 24 hours.',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  const renderSwitch = (value, onValueChange) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.backgroundCard, true: colors.primary }}
      thumbColor={colors.textPrimary}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Playback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          
          {renderSettingItem({
            icon: 'play-circle',
            title: 'Auto-Play',
            subtitle: 'Play next song automatically',
            rightComponent: renderSwitch(autoPlay, setAutoPlay),
          })}
          
          {renderSettingItem({
            icon: 'musical-note',
            title: 'High Quality Audio',
            subtitle: 'Uses more data',
            rightComponent: renderSwitch(highQuality, setHighQuality),
          })}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          {renderSettingItem({
            icon: 'moon',
            title: 'Dark Mode',
            subtitle: 'Always on',
            rightComponent: renderSwitch(darkMode, setDarkMode),
          })}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingItem({
            icon: 'notifications',
            title: 'Push Notifications',
            subtitle: 'Get updates about new music',
            rightComponent: renderSwitch(notifications, setNotifications),
          })}
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          {renderSettingItem({
            icon: 'trash',
            title: 'Clear Cache',
            subtitle: 'Free up space',
            onPress: handleClearCache,
          })}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          {renderSettingItem({
            icon: 'information-circle',
            title: 'About PRX Tuber',
            onPress: handleAbout,
          })}
          
          {renderSettingItem({
            icon: 'shield-checkmark',
            title: 'Privacy Policy',
            onPress: handlePrivacyPolicy,
          })}
          
          {renderSettingItem({
            icon: 'document-text',
            title: 'Terms of Service',
            onPress: handleTermsOfService,
          })}
          
          {renderSettingItem({
            icon: 'mail',
            title: 'Contact Support',
            onPress: handleContactSupport,
          })}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PRX Tuber v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 PRX Tuber. All rights reserved.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});

export default SettingsScreen;
