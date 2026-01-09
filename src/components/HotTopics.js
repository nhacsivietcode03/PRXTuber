// HotTopics Component - Horizontal carousel with pagination
import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import BannerCard from './BannerCard';
import SectionHeader from './SectionHeader';
import colors from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HotTopics = ({ 
  banners = [], 
  onBannerPress, 
  onPlayPress,
  onSeeAllPress,
  loading = false 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (SCREEN_WIDTH * 0.6 + 12));
    setActiveIndex(index);
  };

  const renderBanner = ({ item, index }) => (
    <BannerCard
      title={item.title}
      subtitle={item.subtitle}
      image={item.image}
      onPress={() => onBannerPress?.(item)}
      onPlayPress={() => onPlayPress?.(item)}
    />
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {banners.slice(0, 5).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );

  // Skeleton loading
  if (loading) {
    return (
      <View>
        <SectionHeader title="Hot Topics" showSeeAll={false} />
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonCard} />
          <View style={[styles.skeletonCard, { width: 100 }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader 
        title="Hot Topics" 
        onSeeAllPress={onSeeAllPress}
      />
      
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id?.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={SCREEN_WIDTH * 0.6 + 12}
        decelerationRate="fast"
      />
      
      {banners.length > 1 && renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  skeletonCard: {
    width: SCREEN_WIDTH * 0.6,
    height: 140,
    backgroundColor: colors.backgroundCard,
    borderRadius: 10,
    marginRight: 12,
  },
});

export default HotTopics;
