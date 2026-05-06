// Navigation - App Navigator with Stack
import React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import TopSongsScreen from '../screens/TopSongsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import SearchScreen from '../screens/SearchScreen';
import PlayScreen from '../screens/PlayScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import ArtistListScreen from '../screens/ArtistListScreen';

import { View } from 'react-native';
import { NowPlayingBar, BottomNavBar } from '../components';
import { useMusicPlayer } from '../context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Global Navigation Bar containing Mini Player and Tab Bar
const GlobalNavBar = ({ navigationRef, activeTab, currentRoute }) => {
  const { currentSong } = useMusicPlayer();

  // Don't show on Play screen, Search screen, or when no route is determined yet
  if (currentRoute === 'PlayScreen' || currentRoute === 'SearchScreen' || !currentRoute) return null;

  const handleTabPress = (tabId) => {
    // Navigate to the tab screen directly using the ID (which is now the screen name)
    navigationRef.navigate('MainTabs', { screen: tabId });
  };

  const handleNowPlayingPress = () => {
    if (currentSong) {
      navigationRef.navigate('PlayScreen', { song: currentSong });
    }
  };

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <NowPlayingBar onPress={handleNowPlayingPress} />
      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

// Main Tab Navigator (No internal tabBar as we use the Global one)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ensure native tab bar is hidden
      }}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="DiscoverScreen" component={DiscoverScreen} />
      <Tab.Screen name="FavoritesScreen" component={FavoritesScreen} />
      <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = React.useRef();
  const [activeTab, setActiveTab] = React.useState('HomeScreen');
  const [currentRoute, setCurrentRoute] = React.useState('HomeScreen');

  // List of screens that should update the active tab state
  const TAB_SCREENS = ['HomeScreen', 'DiscoverScreen', 'FavoritesScreen', 'SettingsScreen'];

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const initialRoute = navigationRef.getCurrentRoute()?.name;
        routeNameRef.current = initialRoute;
        setCurrentRoute(initialRoute);
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRoute = navigationRef.getCurrentRoute();
        const currentRouteName = currentRoute?.name;

        if (previousRouteName !== currentRouteName) {
          console.log(`\x1b[35m[Navigation] 🚀 \x1b[32m${currentRouteName}\x1b[0m`);
          setCurrentRoute(currentRouteName);

          // If we land on a tab screen, update the active tab highlighting
          if (TAB_SCREENS.includes(currentRouteName)) {
            setActiveTab(currentRouteName);
          }
          // Special case: if we are inside MainTabs, check which tab is nested
          else if (currentRouteName === 'MainTabs' || !currentRouteName) {
            // We can dig deeper if needed, but the TAB_SCREENS check usually covers it
          }
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={{ flex: 1 }}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {/* Main Tab Screens */}
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />

            {/* Detail Screens */}
            <Stack.Screen name="TopicDetailScreen" component={TopicDetailScreen} />
            <Stack.Screen name="TopSongsScreen" component={TopSongsScreen} />
            <Stack.Screen name="PlaylistDetailScreen" component={PlaylistDetailScreen} />
            <Stack.Screen name="ArtistListScreen" component={ArtistListScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen
              name="PlayScreen"
              component={PlayScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
          </Stack.Navigator>
        </View>

        {/* Global persistent UI (Player + Tabs) */}
        <GlobalNavBar
          navigationRef={navigationRef}
          activeTab={activeTab}
          currentRoute={currentRoute}
        />
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator;
