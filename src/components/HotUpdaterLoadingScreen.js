import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HotUpdaterLoadingScreen = ({ status, progress = 0, downloadedBytes, totalBytes, message }) => {
  const percent = Math.min(100, Math.max(0, Math.round(progress || 0)));
  
  const formatMB = (bytes) => {
    if (!bytes || isNaN(bytes)) return null;
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const downloadedMB = formatMB(downloadedBytes);
  const totalMB = formatMB(totalBytes);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>PrxTuber</Text>
        
        {status === 'CHECK_FOR_UPDATE' ? (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#FF3B30" style={styles.spinner} />
            <Text style={styles.statusText}>Đang kiểm tra bản cập nhật...</Text>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>Đang tải bản cập nhật mới...</Text>
            
            {message ? (
              <Text style={styles.messageText} numberOfLines={2}>
                "{message}"
              </Text>
            ) : null}

            {/* Progress Bar Container */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>

            <View style={styles.progressMeta}>
              <Text style={styles.percentText}>{percent}%</Text>
              {downloadedMB && totalMB ? (
                <Text style={styles.bytesText}>
                  {downloadedMB} MB / {totalMB} MB
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <Text style={styles.footerNote}>
          Vui lòng giữ ứng dụng mở trong giây lát...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: width - 48,
    backgroundColor: '#1E1E26',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#2A2A36',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  statusBox: {
    width: '100%',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#9E9EA7',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#2D2D3A',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 5,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF3B30',
  },
  bytesText: {
    fontSize: 12,
    color: '#8A8A93',
  },
  footerNote: {
    fontSize: 12,
    color: '#6E6E7A',
    marginTop: 28,
    textAlign: 'center',
  },
});

export default HotUpdaterLoadingScreen;
