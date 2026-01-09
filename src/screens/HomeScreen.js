// HomeScreen - Main home screen combining all components
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  HomeHeader, 
  HotTopics, 
  TopSongs, 
  BottomNavBar 
} from '../components';
import colors from '../theme/colors';
import { getTopTracks, getHotTracks } from '../api/musicService';

// Mock data for development (khi chưa có Jamendo API key)
const MOCK_BANNERS = [
  {
    id: '1',
    title: 'Top Song of the Week',
    subtitle: '27 tracks',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
  },
  {
    id: '2',
    title: 'Top EDM Song',
    subtitle: 'Best electronic music',
    image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400',
  },
  {
    id: '3',
    title: 'Chill Vibes',
    subtitle: 'Relax & unwind',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
  },
];

const MOCK_SONGS = [
  {
    id: '1',
    title: 'The Scar to your beautiful',
    artist: 'Alessia Cara',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    duration: 230,
  },
  {
    id: '2',
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
    duration: 195,
  },
  {
    id: '3',
    title: 'Stuck with you',
    artist: 'Justin Bieber ft Ariana Grande',
    image: 'https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=200',
    duration: 212,
  },
  {
    id: '4',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
    duration: 178,
  },
  {
    id: '5',
    title: 'Style',
    artist: 'Taylor Swift',
    image: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=200',
    duration: 248,
  },
];

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [banners, setBanners] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      // Thử fetch từ Jamendo API
      const [hotTracks, topTracks] = await Promise.all([
        getHotTracks(5),
        getTopTracks(6),
      ]);

      // Nếu có data từ API thì dùng, không thì dùng mock
      if (hotTracks.length > 0) {
        setBanners(hotTracks);
      } else {
        setBanners(MOCK_BANNERS);
      }

      if (topTracks.length > 0) {
        setSongs(topTracks);
      } else {
        setSongs(MOCK_SONGS);
      }
    } catch (error) {
      console.log('Using mock data:', error.message);
      // Fallback to mock data
      setBanners(MOCK_BANNERS);
      setSongs(MOCK_SONGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Handlers
  const handleSearchPress = () => {
    Alert.alert('Search', 'Navigate to Search screen');
  };

  const handleBannerPress = (banner) => {
    Alert.alert('Banner', `Open: ${banner.title}`);
  };

  const handlePlayBanner = (banner) => {
    Alert.alert('Play', `Playing: ${banner.title}`);
  };

  const handleSeeAllHotTopics = () => {
    Alert.alert('See All', 'Navigate to Hot Topics list');
  };

  const handleSeeAllTopSongs = () => {
    Alert.alert('See All', 'Navigate to Top Songs list');
  };

  const handleSongPress = (song, index) => {
    setCurrentPlayingId(song.id);
    Alert.alert('Now Playing', `${song.title} - ${song.artist}`);
  };

  const handleMorePress = (song) => {
    Alert.alert(
      song.title,
      'Choose an option',
      [
        { text: 'Play', onPress: () => handleSongPress(song, 0) },
        { text: 'Add to Playlist', onPress: () => {} },
        { text: 'Share', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'home') {
      Alert.alert('Navigation', `Navigate to ${tabId} screen`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <HomeHeader 
          userName="Welcome back!"
          onSearchPress={handleSearchPress}
        />
        
        {/* Hot Topics Section */}
        <HotTopics
          banners={banners}
          onBannerPress={handleBannerPress}
          onPlayPress={handlePlayBanner}
          onSeeAllPress={handleSeeAllHotTopics}
          loading={loading}
        />
        
        {/* Top Songs Section */}
        <TopSongs
          songs={songs}
          currentPlayingId={currentPlayingId}
          onSongPress={handleSongPress}
          onMorePress={handleMorePress}
          onSeeAllPress={handleSeeAllTopSongs}
          loading={loading}
          maxItems={5}
        />
        
        {/* Bottom padding for nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavBar 
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  bottomPadding: {
    height: 20,
  },
});

export default HomeScreen;
