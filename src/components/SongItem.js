// SongItem Component - Song list item with thumbnail, title, artist
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const SongItem = ({ 
  id,
  title, 
  artist, 
  image, 
  song,
  isPlaying = false,
  isCurrentSong = false,
  onPress,
  onMorePress,
}) => {
  const handleMorePress = () => {
    console.log('3-dot pressed for:', title);
    if (onMorePress) {
      onMorePress(song || { id, title, artist, image });
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        (isPlaying || isCurrentSong) && styles.containerPlaying
      ]}
    >
      <TouchableOpacity 
        style={styles.mainContent}
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
      </TouchableOpacity>
      
      {/* More menu button - separate from main touchable */}
      <Pressable 
        style={styles.moreButton}
        onPress={handleMorePress}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  moreButton: {
    padding: 8,
  },
});

export default SongItem;
