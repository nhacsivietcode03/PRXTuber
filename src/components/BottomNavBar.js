// BottomNavBar Component - 4 tabs navigation
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const tabs = [
  { id: 'home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { id: 'discover', label: 'Discover', icon: 'compass', iconOutline: 'compass-outline' },
  { id: 'favorites', label: 'Favorites', icon: 'heart', iconOutline: 'heart-outline' },
  { id: 'settings', label: 'Settings', icon: 'settings', iconOutline: 'settings-outline' },
];

const BottomNavBar = ({ activeTab = 'home', onTabPress }) => {
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
              />
              {/* Active indicator dot */}
              {isActive && <View style={styles.activeDot} />}
              {/* Uncomment for labels */}
              {/* <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text> */}
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
    backgroundColor: colors.textPrimary,
    marginTop: 4,
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
