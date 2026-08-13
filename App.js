import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { MusicPlayerProvider, PlaylistProvider } from './src/context';
import { HotUpdater } from "@hot-updater/react-native";

function App() {
  React.useEffect(() => {
    if (__DEV__) {
      console.log('[HotUpdater Test] Skipping connection test in development mode.');
      return;
    }
    const url = "https://prxtuber-updater-worker.iop883684.workers.dev/api/check-update";
    console.log(`[HotUpdater Test] Calling: ${url}`);
    let responseStatus = 0;
    fetch(`${url}/version`)
      .then(res => {
        responseStatus = res.status;
        console.log(`[HotUpdater Test] Status: ${res.status}`);
        return res.text();
      })
      .then(text => {
        console.log(`[HotUpdater Test] Response:`, text);
        Alert.alert(
          "HotUpdater Test",
          `Status: ${responseStatus}\nResponse: ${text.substring(0, 500)}`
        );
      })
      .catch(err => {
        console.error(`[HotUpdater Test] Connection Error:`, err);
        Alert.alert(
          "HotUpdater Test Error",
          err.message || String(err)
        );
      });
  }, []);

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

export default __DEV__
  ? App
  : HotUpdater.wrap({
      baseURL: "https://prxtuber-updater-worker.iop883684.workers.dev/api/check-update",
      updateStrategy: "appVersion",
    })(App);
