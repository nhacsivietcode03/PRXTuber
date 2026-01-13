// PlayScreen - Music/Video Player Screen (Figma Design Match)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import colors from '../theme/colors';
import { useMusicPlayer } from '../context';
import { AddToPlaylistSheet } from '../components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PlayScreen = ({ route, navigation }) => {
  const { song, playlist: routePlaylist = [] } = route.params || {};
  
  const {
    currentSong,
    playlist,
    isPlaying,
    isLoading,
    duration,
    position,
    repeatMode,
    isFavorite,
    playSong,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
    toggleFavorite,
    toggleRepeat,
    setPlaylist,
    formatTime,
  } = useMusicPlayer();
  
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const playlistSheetAnim = useRef(new Animated.Value(0)).current;

  // Play the song from route params when screen opens
  useEffect(() => {
    if (song && (!currentSong || currentSong.id !== song.id)) {
      playSong(song, routePlaylist);
    } else if (routePlaylist.length > 0 && playlist.length === 0) {
      setPlaylist(routePlaylist);
    }
  }, [song?.id]);

  // Toggle playlist sheet
  const togglePlaylistSheet = () => {
    const toValue = showPlaylist ? 0 : 1;
    Animated.spring(playlistSheetAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setShowPlaylist(!showPlaylist);
  };

  // Play song from playlist
  const playSongFromPlaylist = (selectedSong) => {
    playSong(selectedSong, playlist);
    togglePlaylistSheet();
  };

  // Get repeat icon
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 1: return 'repeat';
      case 2: return 'repeat-one';
      default: return 'repeat';
    }
  };

  // Render playlist item
  const renderPlaylistItem = ({ item }) => {
    const isCurrentSong = item.id === currentSong?.id;
    return (
      <TouchableOpacity
        style={[styles.playlistItem, isCurrentSong && styles.playlistItemActive]}
        onPress={() => playSongFromPlaylist(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/60' }}
          style={styles.playlistItemImage}
        />
        <View style={styles.playlistItemInfo}>
          <Text
            style={[styles.playlistItemTitle, isCurrentSong && styles.playlistItemTitleActive]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.playlistItemArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        {isCurrentSong && (
          <Ionicons name="musical-note" size={16} color={colors.primary} />
        )}
        <TouchableOpacity style={styles.playlistItemMore}>
          <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const playlistTranslateY = playlistSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT * 0.6, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Video/Image Area - Top Section */}
      <View style={styles.videoSection}>
        {/* Black background area */}
        <View style={styles.videoTopBlack} />
        
        {/* Album/Video Image */}
        <Image
          source={{ uri: currentSong?.image || 'https://via.placeholder.com/400' }}
          style={styles.videoImage}
          resizeMode="cover"
        />
        
        {/* Header Overlay */}
        <SafeAreaView style={styles.headerOverlay} edges={['top']}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuButton}>
            <Feather name="menu" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Video Controls - Below Image */}
      <View style={styles.videoControlsRow}>
        <TouchableOpacity style={styles.videoControlButton}>
          <MaterialCommunityIcons name="fullscreen" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.videoControlButton}>
          <Feather name="external-link" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Song Info - Centered */}
        <View style={styles.songInfoContainer}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {currentSong?.title || 'Unknown Title'}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {currentSong?.artist || 'Unknown Artist'}
          </Text>
        </View>

        {/* Progress Bar - Hidden when playlist is open */}
        {!showPlaylist && <View style={styles.progressContainer}>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onSlidingComplete={seekTo}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
            thumbTintColor={colors.primary}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>}

        {/* Main Controls - Hidden when playlist is open */}
        {!showPlaylist && <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={toggleFavorite} style={styles.sideControlButton}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.accent : colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={playPrevious} style={styles.skipButton}>
            <Ionicons name="play-skip-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.playButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass" size={32} color={colors.background} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={36}
                color={colors.background}
                style={!isPlaying && { marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.skipButton}>
            <Ionicons name="play-skip-forward" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleRepeat} style={styles.sideControlButton}>
            <MaterialIcons
              name={getRepeatIcon()}
              size={24}
              color={repeatMode > 0 ? colors.primary : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>}

        {/* Bottom Actions - Hidden when playlist is open */}
        {!showPlaylist && <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="share-2" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowAddToPlaylist(true)}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={togglePlaylistSheet}
          >
            <Feather name="menu" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>}
      </View>

      {/* Playlist Bottom Sheet */}
      {showPlaylist && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={togglePlaylistSheet}
        />
      )}
      
      <Animated.View
        style={[
          styles.playlistSheet,
          { transform: [{ translateY: playlistTranslateY }] },
        ]}
      >
        <View style={styles.playlistSheetHandle}>
          <View style={styles.handleBar} />
        </View>
        
        <Text style={styles.playlistSheetTitle}>Playlist</Text>
        
        <FlatList
          data={playlist}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlaylistItem}
          contentContainerStyle={styles.playlistContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Add to Playlist Sheet */}
      <AddToPlaylistSheet
        visible={showAddToPlaylist}
        song={currentSong}
        onClose={() => setShowAddToPlaylist(false)}
        onSuccess={(message) => {
          Alert.alert('Success', message);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Video Section - Top half
  videoSection: {
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoTopBlack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#000',
  },
  videoImage: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Video Controls Row - Below image
  videoControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  videoControlButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content Section - Bottom half
  contentSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  songInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  songArtist: {
    fontSize: 12,
    color: '#909090',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Progress
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: '400',
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  sideControlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Overlay & Playlist Sheet
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playlistSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  playlistSheetHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
  },
  playlistSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  playlistContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.divider,
  },
  playlistItemActive: {
    backgroundColor: 'rgba(2, 205, 172, 0.1)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  playlistItemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: colors.background,
  },
  playlistItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  playlistItemTitleActive: {
    color: colors.primary,
  },
  playlistItemArtist: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playlistItemMore: {
    padding: 8,
  },
});

export default PlayScreen;
