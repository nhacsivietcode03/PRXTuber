// HomeScreen - Main home screen combining all components
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  HomeHeader,
  HotTopics,
  TopSongs,
  Discover,
  NowPlayingBar,
  BottomNavBar,
  SongBottomSheet,
  AddToPlaylistSheet,
} from '../components';
import colors from '../theme/colors';
import { getTopTracks, getHotTracks, getPlaylists, getArtists, getTracksByGenre, getTracksByPlaylist, getAppFeatures } from '../api/musicService';
import { useMusicPlayer } from '../context';
const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [banners, setBanners] = useState([]);
  const [songs, setSongs] = useState([]);
  const [discoverItems, setDiscoverItems] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // Use global music player context
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlayPause,
    progress,
  } = useMusicPlayer();

  // Fetch data from Jamendo API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hotTracks, topTracks, artistsData] = await Promise.all([
        getHotTracks(5),
        getTopTracks(6),
        getArtists(20),
      ]);

      let featuresPlaylists = await getAppFeatures();
      
      // Fallback to Jamendo playlists if app features fail
      if (!featuresPlaylists || featuresPlaylists.length === 0) {
        featuresPlaylists = await getPlaylists(6);
      }

      const mappedArtists = artistsData
        .filter(artist => artist.image && artist.image.trim() !== '')
        .slice(0, 12) // Ensure we show around 12 as requested
        .map(artist => ({
          ...artist,
          title: artist.name,
          subtitle: 'Artist'
        }));

      setBanners(hotTracks);
      setSongs(topTracks);
      setDiscoverItems(featuresPlaylists);
      setArtists(mappedArtists);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải dữ liệu. Vui lòng thử lại.' });
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
    navigation.navigate('SearchScreen');
  };

  const handleBannerPress = (banner) => {
    navigation.navigate('TopicDetailScreen', {
      topic: {
        id: banner.id,
        title: banner.title,
        image: banner.image,
        genre: banner.genre || null,
        artistId: banner.artistId || null,
      }
    });
  };

  const handlePlayBanner = (banner) => {
    // Navigate and auto-play
    navigation.navigate('TopicDetailScreen', {
      topic: {
        id: banner.id,
        title: banner.title,
        image: banner.image,
        genre: banner.genre || null,
        artistId: banner.artistId || null,
        autoPlay: true,
      }
    });
  };

  const handleSeeAllHotTopics = () => {
    Toast.show({ type: 'info', text1: 'See All', text2: 'Navigate to Hot Topics list' });
  };

  const handleSeeAllTopSongs = () => {
    navigation.navigate('TopSongsScreen');
  };

  const handleSeeAllDiscover = () => {
    navigation.navigate('DiscoverScreen', { features: discoverItems, title: 'Featured' });
  };

  const handleSeeAllArtists = () => {
    navigation.navigate('ArtistListScreen', { title: 'Artists' });
  };

  const handleDiscoverItemPress = async (item) => {
    try {
      Toast.show({ type: 'info', text1: 'Loading Playlist...', text2: `Fetching tracks for ${item.title}` });
      
      let tracks = [];
      if (item.type === 'playlist' && item.originalId) {
        tracks = await getTracksByPlaylist(item.originalId);
      } else if (item.genre) {
        tracks = await getTracksByGenre(item.genre, 30, 'popularity_month');
      }
      
      if (tracks && tracks.length > 0) {
        // Play the first track and queue the rest
        playSong(tracks[0], tracks);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'No tracks found for this playlist.' });
      }
    } catch (error) {
      console.error('Playlist fetch error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load playlist.' });
    }
  };

  const handleArtistPress = (item) => {
    navigation.navigate('TopicDetailScreen', {
      topic: {
        id: item.id,
        title: item.title,
        image: item.image,
        isArtist: true,
      }
    });
  };

  const handleSongPress = (song, index) => {
    // Navigate to PlayScreen - context will handle playback
    navigation.navigate('PlayScreen', { song, playlist: songs });
  };

  const handlePlayPause = () => {
    togglePlayPause();
  };

  const handleNowPlayingPress = () => {
    if (currentSong) {
      navigation.navigate('PlayScreen', { song: currentSong, playlist: songs });
    }
  };

  const handleMorePress = (song) => {
    console.log('HomeScreen handleMorePress:', song?.title, song?.image);
    if (song) {
      setSelectedSong(song);
      setShowBottomSheet(true);
    }
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setSelectedSong(null);
  };

  const handleBottomSheetPlay = () => {
    if (selectedSong) {
      playSong(selectedSong, songs);
    }
  };

  const handleAddToPlaylist = () => {
    setShowBottomSheet(false);
    setTimeout(() => {
      setShowAddToPlaylist(true);
    }, 300);
  };

  const handleAddToPlaylistSuccess = (message) => {
    Toast.show({ type: 'success', text1: 'Success', text2: message });
  };

  const handleAddToFavorites = () => {
    Toast.show({ type: 'success', text1: 'Add to Favorites', text2: `"${selectedSong?.title}" added to your favorites!` });
  };

  const handleShare = () => {
    Toast.show({ type: 'info', text1: 'Share', text2: `Share "${selectedSong?.title}" by ${selectedSong?.artist}` });
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Navigation is now handled by the CustomTabBar in AppNavigator
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
          currentPlayingId={currentSong?.id}
          onSongPress={handleSongPress}
          onMorePress={handleMorePress}
          onSeeAllPress={handleSeeAllTopSongs}
          loading={loading}
          maxItems={5}
        />

        {/* Featured Playlists Section */}
        <Discover
          title="Featured"
          variant="radio"
          playlists={discoverItems}
          onPlaylistPress={handleDiscoverItemPress}
          onSeeAllPress={handleSeeAllDiscover}
          loading={loading}
        />

        {/* Artists Section */}
        <Discover
          title="Artists"
          variant="artist"
          playlists={artists}
          onPlaylistPress={handleArtistPress}
          onSeeAllPress={handleSeeAllArtists}
          loading={loading}
        />

        {/* Bottom padding for nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Now Playing Bar and Bottom Navigation are now handled by AppNavigator's CustomTabBar */}

      {/* Song Bottom Sheet */}
      <SongBottomSheet
        visible={showBottomSheet}
        song={selectedSong}
        onClose={handleCloseBottomSheet}
        onPlay={handleBottomSheetPlay}
        onAddToPlaylist={handleAddToPlaylist}
        onAddToFavorites={handleAddToFavorites}
        onShare={handleShare}
      />

      {/* Add to Playlist Sheet */}
      <AddToPlaylistSheet
        visible={showAddToPlaylist}
        song={selectedSong}
        onClose={() => setShowAddToPlaylist(false)}
        onSuccess={handleAddToPlaylistSuccess}
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
