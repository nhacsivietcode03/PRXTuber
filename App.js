import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { MusicPlayerProvider, PlaylistProvider } from './src/context';
import { HotUpdater } from "@hot-updater/react-native";
import HotUpdaterLoadingScreen from './src/components/HotUpdaterLoadingScreen';
import { HOT_UPDATER_CONFIG } from './src/config/hotUpdater';

function App() {
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

const WrappedApp = HotUpdater.wrap({
  baseURL: HOT_UPDATER_CONFIG.baseURL,
  updateStrategy: HOT_UPDATER_CONFIG.updateStrategy,
  fallbackComponent: HotUpdaterLoadingScreen,
  onError: (error) => {
    console.warn('[HotUpdater Error]', error);
  },
  onUpdateProcessCompleted: (response) => {
    console.log('[HotUpdater] Update process completed:', response);
  },
})(App);

export default (__DEV__ && !HOT_UPDATER_CONFIG.enableInDev) ? App : WrappedApp;
