import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Alert, Platform } from 'react-native';
import { HotUpdater } from '@hot-updater/react-native';

const LOG_STORAGE_KEY = '@prxtuber_hotupdater_logs';
const MAX_LOG_ENTRIES = 150;

class Logger {
  constructor() {
    this.logs = [];
    this.loadLogs();
  }

  async loadLogs() {
    try {
      const data = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (data) {
        this.logs = JSON.parse(data);
      }
    } catch (e) {
      console.error('[Logger] Failed to load logs:', e);
    }
  }

  async log(tag, message, details = null) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      tag,
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      details: details ? (typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)) : null,
    };
    
    console.log(`[${tag}] ${entry.message}`, details || '');
    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(0, MAX_LOG_ENTRIES);
    }

    try {
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error('[Logger] Failed to save log:', e);
    }
  }

  async getLogs() {
    await this.loadLogs();
    return this.logs;
  }

  async clearLogs() {
    this.logs = [];
    try {
      await AsyncStorage.removeItem(LOG_STORAGE_KEY);
    } catch (e) {
      console.error('[Logger] Failed to clear logs:', e);
    }
  }

  async exportAndShareLogs() {
    await this.loadLogs();
    
    // Get HotUpdater & Native info safely
    let nativeAppVersion = 'unknown';
    let bundleId = 'unknown';
    let minBundleId = 'unknown';
    let channel = 'unknown';
    let baseURL = 'unknown';
    
    try { nativeAppVersion = HotUpdater.getAppVersion() || 'unknown'; } catch(e) {}
    try { bundleId = HotUpdater.getBundleId() || 'unknown'; } catch(e) {}
    try { minBundleId = HotUpdater.getMinBundleId() || 'unknown'; } catch(e) {}
    try { channel = HotUpdater.getChannel() || 'unknown'; } catch(e) {}
    try { baseURL = HotUpdater.getBaseURL() || 'unknown'; } catch(e) {}

    const header = [
      `==========================================`,
      `PRXTUBER HOTUPDATER DIAGNOSTIC LOGS`,
      `Time: ${new Date().toLocaleString()}`,
      `OS: ${Platform.OS} (v${Platform.Version})`,
      `__DEV__: ${__DEV__}`,
      `App Version: ${nativeAppVersion}`,
      `Current Bundle ID: ${bundleId}`,
      `Min Bundle ID: ${minBundleId}`,
      `Channel: ${channel}`,
      `Base URL: ${baseURL}`,
      `Total Log Entries: ${this.logs.length}`,
      `==========================================`,
      ``
    ].join('\n');

    const logLines = this.logs.map(item => {
      let line = `[${item.timestamp}] [${item.tag}] ${item.message}`;
      if (item.details) {
        line += `\nDetails: ${item.details}`;
      }
      return line;
    }).join('\n------------------------------------------\n');

    const fullText = `${header}\n${logLines || 'No logs recorded yet.'}`;

    try {
      await Share.share({
        title: 'PrxTuber HotUpdater Diagnostics Log',
        message: fullText,
      });
    } catch (error) {
      Alert.alert('Share Error', error.message || String(error));
    }
  }
}

export const logger = new Logger();
