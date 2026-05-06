// BottomNavBar Component - 4 tabs navigation
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

const tabs = [
  { id: 'HomeScreen', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { id: 'DiscoverScreen', label: 'Discover', icon: 'grid', iconOutline: 'grid-outline' },
  { id: 'FavoritesScreen', label: 'Favorites', icon: 'heart', iconOutline: 'heart-outline' },
  { id: 'SettingsScreen', label: 'Settings', icon: 'person', iconOutline: 'person-outline' },
];

const BottomNavBar = ({ activeTab = 'HomeScreen', onTabPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress?.(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.icon : tab.iconOutline}
                size={24}
                color={isActive ? colors.tabActive : colors.tabInactive}
                style={isActive ? styles.activeIcon : null}
              />
              {/* Active indicator dot */}
              {isActive && (
                <LinearGradient
                  colors={colors.primaryGradient}
                  style={styles.activeDot}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: 8,
    // Top shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20, // For Android
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -4,
  },
  activeIcon: {
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  label: {
    fontSize: 10,
    color: colors.tabInactive,
    marginTop: 2,
  },
  labelActive: {
    color: colors.tabActive,
    fontWeight: '600',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: colors.textPrimary,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 8,
  },
});

export default BottomNavBar;
