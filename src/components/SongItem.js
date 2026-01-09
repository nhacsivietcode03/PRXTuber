// SongItem Component - Song list item with thumbnail, title, artist
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const SongItem = ({ 
  id,
  title, 
  artist, 
  image, 
  duration,
  isPlaying = false,
  onPress, 
  onMorePress 
}) => {
  // Format duration from seconds to mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isPlaying && styles.containerPlaying]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: image || 'https://via.placeholder.com/60' }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      
      <View style={styles.info}>
        <Text 
          style={[styles.title, isPlaying && styles.titlePlaying]} 
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      </View>
      
      {duration && (
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
      )}
      
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={onMorePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  containerPlaying: {
    backgroundColor: colors.backgroundCard,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 5,
    backgroundColor: colors.backgroundCard,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  titlePlaying: {
    color: colors.primary,
  },
  artist: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  duration: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 8,
  },
  moreButton: {
    padding: 8,
  },
});

export default SongItem;
