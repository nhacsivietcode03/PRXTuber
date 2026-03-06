import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { MusicPlayerProvider, PlaylistProvider } from './src/context';

export default function App() {
  return (
    <SafeAreaProvider>
      <PlaylistProvider>
        <MusicPlayerProvider>
          <AppNavigator />
          <Toast />
        </MusicPlayerProvider>
      </PlaylistProvider>
    </SafeAreaProvider>
  );
}
