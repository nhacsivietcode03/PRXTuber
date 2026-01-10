// Navigation - App Navigator with Stack
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import TopSongsScreen from '../screens/TopSongsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
        <Stack.Screen name="TopSongs" component={TopSongsScreen} />
        <Stack.Screen name="Discover" component={DiscoverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
