// DiscoverScreen - Display artists grid for discovery (Figma design)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BottomNavBar } from '../components';
import colors from '../theme/colors';
import { getArtists } from '../api/musicService';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SPACING = 16;
const ITEM_WIDTH = (width - (ITEM_SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

const DiscoverScreen = ({ navigation }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  // Fetch artists
  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getArtists(30); // Fetch 30 artists for grid
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
      Alert.alert('Error', 'Could not load artists. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchArtists();
    setRefreshing(false);
  }, [fetchArtists]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // Handlers
  const handleBack = () => {
    navigation.goBack();
  };

  const handleArtistPress = (artist) => {
    // Navigate to artist detail with their tracks
    navigation.navigate('TopicDetail', {
      topic: {
        id: artist.id,
        title: artist.name,
        image: artist.image,
        isArtist: true,
      }
    });
  };

  const handleSearch = () => {
    navigation.navigate('Search');
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigation.navigate('Home');
    } else if (tabId === 'search') {
      navigation.navigate('Search');
    }
  };

  // Background colors for artist cards
  const bgColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
  ];

  const defaultArtistImage = 'https://via.placeholder.com/200/333333/02CDAC?text=Artist';

  const renderArtistItem = ({ item, index }) => {
    const bgColor = bgColors[index % bgColors.length];
    const imageUri = item.image && item.image.trim() !== '' ? item.image : defaultArtistImage;

    return (
      <TouchableOpacity 
        style={styles.artistItem}
        onPress={() => handleArtistPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.artistImageContainer, { backgroundColor: bgColor }]}>
          <Image 
            source={{ uri: imageUri }}
            style={styles.artistImage}
            resizeMode="cover"
            defaultSource={{ uri: defaultArtistImage }}
          />
        </View>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Artists Grid */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading artists...</Text>
        </View>
      ) : (
        <FlatList
          data={artists}
          renderItem={renderArtistItem}
          keyExtractor={(item) => item.id?.toString()}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No artists found</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchArtists}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: ITEM_SPACING,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'flex-start',
    gap: ITEM_SPACING,
    marginBottom: ITEM_SPACING,
  },
  artistItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  artistImageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  artistImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  artistName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default DiscoverScreen;
