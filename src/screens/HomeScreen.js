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
  Discover,
  BottomNavBar 
} from '../components';
import colors from '../theme/colors';
import { getTopTracks, getHotTracks, getPlaylists } from '../api/musicService';

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [banners, setBanners] = useState([]);
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  // Fetch data from Jamendo API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hotTracks, topTracks, playlistData] = await Promise.all([
        getHotTracks(5),
        getTopTracks(6),
        getPlaylists(6),
      ]);

      setBanners(hotTracks);
      setSongs(topTracks);
      setPlaylists(playlistData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
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

  const handleSeeAllDiscover = () => {
    Alert.alert('See All', 'Navigate to Discover/Playlists');
  };

  const handlePlaylistPress = (playlist) => {
    Alert.alert('Playlist', `Open: ${playlist.title}`);
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
        
        {/* Discover Section */}
        <Discover
          playlists={playlists}
          onPlaylistPress={handlePlaylistPress}
          onSeeAllPress={handleSeeAllDiscover}
          loading={loading}
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
