// NowPlayingBar - Mini player synced with global music player context
import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useMusicPlayer } from '../context';

const NowPlayingBar = ({ 
  onPress,
}) => {
  const { 
    currentSong, 
    isPlaying, 
    progress, 
    togglePlayPause 
  } = useMusicPlayer();

  if (!currentSong) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Progress bar at top */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <Image 
          source={{ uri: currentSong.image }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={28} 
            color={colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: '#000000',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.backgroundCard,
    width: '100%',
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: colors.backgroundCard,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  artist: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NowPlayingBar;
