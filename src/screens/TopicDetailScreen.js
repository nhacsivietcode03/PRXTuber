// TopicDetailScreen - Shows songs in a topic/playlist
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { SongItem, NowPlayingBar, BottomNavBar, SongBottomSheet, AddToPlaylistSheet } from '../components';
import colors from '../theme/colors';
import { getTracksByGenre, getTopTracks, getTracksByArtist } from '../api/musicService';
import { useMusicPlayer } from '../context';

const SONG_LIMIT = 20;

const TopicDetailScreen = ({ route, navigation }) => {
  const { topic } = route.params || {};

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSong, setSelectedSong] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // Use global music player context
  const { currentSong, playSong } = useMusicPlayer();

  const fetchTracksWithOffset = useCallback(async (offset = 0) => {
    if (topic?.isArtist && topic?.id) {
      return await getTracksByArtist(topic.id, SONG_LIMIT, offset);
    } else if (topic?.genre) {
      return await getTracksByGenre(topic.genre, SONG_LIMIT, 'popularity_total', offset);
    } else if (topic?.artistId) {
      return await getTracksByArtist(topic.artistId, SONG_LIMIT, offset);
    } else {
      return await getTopTracks(SONG_LIMIT, 'popularity_total', offset);
    }
  }, [topic?.genre, topic?.artistId, topic?.isArtist, topic?.id]);

  // Fetch songs for this topic
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const tracks = await fetchTracksWithOffset(0);
      setSongs(tracks);
      setHasMore(tracks.length >= SONG_LIMIT);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchTracksWithOffset]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const newTracks = await fetchTracksWithOffset(songs.length);
      if (newTracks.length < SONG_LIMIT) setHasMore(false);
      if (newTracks.length > 0) {
        setSongs(prev => [...prev, ...newTracks]);
      }
    } catch (error) {
      console.error('Error loading more songs:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, songs.length, fetchTracksWithOffset]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Handlers
  const handleBack = () => {
    navigation.goBack();
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleSongPress = (song, index) => {
    // Navigate to PlayScreen - context will handle playback
    navigation.navigate('Play', { song, playlist: songs });
  };

  const handleNowPlayingPress = () => {
    // Navigate to full player screen
    if (currentSong) {
      navigation.navigate('Play', { song: currentSong, playlist: songs });
    }
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigation.goBack();
    }
  };

  const handleMorePress = (songData) => {
    console.log('handleMorePress called with:', JSON.stringify(songData));
    if (songData) {
      console.log('Setting selectedSong and showing bottom sheet');
      setSelectedSong(songData);
      setShowBottomSheet(true);
    } else {
      console.log('songData is null/undefined');
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

  const renderSongItem = ({ item: song, index }) => (
    <SongItem
      key={song.id}
      id={song.id}
      title={song.title}
      artist={song.artist}
      image={song.image}
      song={song}
      isPlaying={song.id === currentSong?.id}
      isCurrentSong={song.id === currentSong?.id}
      onPress={() => handleSongPress(song, index)}
      onMorePress={handleMorePress}
    />
  );

  const renderHeader = () => (
    <>
      {/* Hero Banner */}
      <ImageBackground
        source={{ uri: topic?.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' }}
        style={styles.heroBanner}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(18,18,18,1)']}
          style={styles.heroGradient}
        >
          {/* Header */}
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {topic?.title || 'Top songs of the week'}
              </Text>
              <View style={styles.placeholder} />
            </View>
          </SafeAreaView>

          {/* Topic Info */}
          <View style={styles.topicInfo}>
            <Text style={styles.topicTitle}>
              {topic?.title || 'Top songs of the week'}
            </Text>

            {/* Centered Play All Button */}
            <View style={styles.playAllContainer}>
              <TouchableOpacity
                style={styles.playAllButton}
                onPress={handlePlayAll}
              >
                <Ionicons name="play" size={18} color={colors.background} />
                <Text style={styles.playAllText}>Play all</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.trackCount}>
              {songs.length} tracks
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Section Title */}
      <View style={styles.songsSection}>
        <Text style={styles.sectionTitle}>Top Song</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{ paddingBottom: 150 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 16 }} />
          ) : null}
        />
      )}

      {/* Now Playing Bar */}
      <NowPlayingBar
        onPress={handleNowPlayingPress}
      />

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

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
    </View>
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
  heroBanner: {
    height: 280,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  topicInfo: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  playAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 6,
  },
  trackCount: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  songsSection: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loader: {
    marginTop: 40,
  },
  bottomSpacing: {
    height: 150,
  },
});

export default TopicDetailScreen;
