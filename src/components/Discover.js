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
import colors from '../theme/colors';

const Discover = ({ 
  playlists = [], 
  onPlaylistPress, 
  onSeeAllPress,
  loading = false,
}) => {
  
  // Skeleton loading
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <DiscoverCard
      title={item.title}
      subtitle={item.trackCount ? `${item.trackCount} tracks` : item.subtitle}
      image={item.image}
      onPress={() => onPlaylistPress?.(item)}
    />
  );

  return (
    <View style={styles.container}>
      <SectionHeader 
        title="Discover"
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
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
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
