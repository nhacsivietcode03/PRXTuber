// TopSongs Component - Vertical list of songs
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import SongItem from './SongItem';
import SectionHeader from './SectionHeader';
import colors from '../theme/colors';

const TopSongs = ({ 
  songs = [], 
  currentPlayingId,
  onSongPress, 
  onMorePress,
  onSeeAllPress,
  loading = false,
  maxItems = 5,
}) => {
  const displaySongs = songs.slice(0, maxItems);

  const renderSong = ({ item, index }) => (
    <SongItem
      id={item.id}
      title={item.title}
      artist={item.artist}
      image={item.image}
      duration={item.duration}
      isPlaying={item.id === currentPlayingId}
      onPress={() => onSongPress?.(item, index)}
      onMorePress={() => onMorePress?.(item)}
    />
  );

  // Skeleton loading
  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Top Song" showSeeAll={false} />
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.skeletonItem}>
            <View style={styles.skeletonThumb} />
            <View style={styles.skeletonInfo}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonArtist} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader 
        title="Top Song" 
        onSeeAllPress={onSeeAllPress}
      />
      
      {displaySongs.map((song, index) => (
        <SongItem
          key={song.id}
          id={song.id}
          title={song.title}
          artist={song.artist}
          image={song.image}
          duration={song.duration}
          isPlaying={song.id === currentPlayingId}
          onPress={() => onSongPress?.(song, index)}
          onMorePress={() => onMorePress?.(song)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skeletonThumb: {
    width: 56,
    height: 56,
    borderRadius: 5,
    backgroundColor: colors.backgroundCard,
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonTitle: {
    width: '70%',
    height: 14,
    backgroundColor: colors.backgroundCard,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonArtist: {
    width: '40%',
    height: 10,
    backgroundColor: colors.backgroundCard,
    borderRadius: 4,
  },
});

export default TopSongs;
