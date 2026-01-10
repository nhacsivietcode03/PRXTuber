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
  isPlaying = false,
  isCurrentSong = false,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        (isPlaying || isCurrentSong) && styles.containerPlaying
      ]}
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
          style={[
            styles.title, 
            (isPlaying || isCurrentSong) && styles.titlePlaying
          ]} 
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      </View>
      
      {/* Show equalizer icon when playing */}
      {isCurrentSong && (
        <View style={styles.equalizerIcon}>
          <Ionicons name="bar-chart" size={18} color={colors.primary} />
        </View>
      )}
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
  equalizerIcon: {
    padding: 8,
  },
});

export default SongItem;
