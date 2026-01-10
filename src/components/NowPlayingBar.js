// NowPlayingBar - Mini player with audio playback and progress bar
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const NowPlayingBar = ({ 
  song,
  isPlaying = false,
  onPlayPause,
  onPress,
  onPlaybackStatusUpdate,
}) => {
  const soundRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // Load and play audio when song changes
  useEffect(() => {
    if (song?.audio) {
      loadAudio();
    }
    
    return () => {
      // Cleanup: unload sound when component unmounts or song changes
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [song?.id]);

  // Play/pause based on isPlaying prop
  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.playAsync();
      } else {
        soundRef.current.pauseAsync();
      }
    }
  }, [isPlaying]);

  const loadAudio = async () => {
    try {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audio },
        { shouldPlay: isPlaying },
        onPlaybackStatus
      );
      
      soundRef.current = sound;
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatus = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      
      if (status.durationMillis > 0) {
        const progressPercent = (status.positionMillis / status.durationMillis) * 100;
        setProgress(progressPercent);
      }

      // Notify parent about playback status
      onPlaybackStatusUpdate?.(status);

      // Auto-pause when finished
      if (status.didJustFinish && !status.isLooping) {
        setProgress(0);
        onPlayPause?.(); // Toggle to paused state
      }
    }
  };

  if (!song) return null;

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
          source={{ uri: song.image }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            onPlayPause?.();
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
