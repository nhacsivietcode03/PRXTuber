// Discover - Horizontal list of playlists/albums for discovery
import React from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import SectionHeader from './SectionHeader';
import DiscoverCard from './DiscoverCard';
import RadioCard from './RadioCard';
import colors from '../theme/colors';

const Discover = ({ 
  title = "Discover",
  playlists = [], 
  onPlaylistPress, 
  onSeeAllPress,
  loading = false,
  variant = 'default',
}) => {
  
  // Skeleton loading
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={[
          styles.skeletonCard, 
          variant === 'radio' && styles.skeletonCardRadio,
          variant === 'artist' && styles.skeletonCardArtist
        ]}>
          <View style={[
            styles.skeletonImage,
            variant === 'radio' && styles.skeletonImageRadio,
            variant === 'artist' && styles.skeletonImageArtist
          ]} />
          <View style={[styles.skeletonTitle, (variant === 'artist' || variant === 'radio') && {alignSelf: 'center'}]} />
          <View style={[styles.skeletonSubtitle, (variant === 'artist' || variant === 'radio') && {alignSelf: 'center'}]} />
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }) => {
    const trackCount = item.tracks?.length || item.trackCount;
    const itemSubtitle = trackCount ? `${trackCount} tracks` : item.subtitle;
    
    return (
      <DiscoverCard
        title={item.title}
        subtitle={itemSubtitle}
        image={item.image}
        onPress={() => onPlaylistPress?.(item)}
        variant={variant}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title}
        onSeeAllPress={onSeeAllPress}
        showSeeAll={true}
      />
      
      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  skeletonCard: {
    width: 140,
    marginRight: 12,
  },
  skeletonImage: {
    width: 140,
    height: 140,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonImageRadio: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  skeletonImageArtist: {
    borderRadius: 70,
  },
  skeletonTitle: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.backgroundCard,
    marginTop: 8,
  },
  skeletonSubtitle: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.backgroundCard,
    marginTop: 4,
  },
});

export default Discover;
