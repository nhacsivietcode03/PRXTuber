// TopicDetailScreen - Shows songs in a topic/playlist
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { SongItem, NowPlayingBar, BottomNavBar, SongBottomSheet, AddToPlaylistSheet } from '../components';
import colors from '../theme/colors';
import { getTracksByGenre, getTopTracks, getTracksByArtist } from '../api/musicService';
import { useMusicPlayer } from '../context';

const TopicDetailScreen = ({ route, navigation }) => {
  const { topic } = route.params || {};
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSong, setSelectedSong] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // Use global music player context
  const { currentSong, playSong } = useMusicPlayer();

  // Fetch songs for this topic
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      let tracks;
      
      if (topic?.isArtist && topic?.id) {
        // Fetch by artist ID (from Discover screen)
        tracks = await getTracksByArtist(topic.id, 20);
      } else if (topic?.genre) {
        // Fetch by genre/tag
        tracks = await getTracksByGenre(topic.genre, 20);
      } else if (topic?.artistId) {
        // Fetch by artist ID (for hot topics from specific artist)
        tracks = await getTracksByArtist(topic.artistId, 20);
      } else {
        // Fallback to top tracks
        tracks = await getTopTracks(20);
      }
      
      setSongs(tracks);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  }, [topic?.genre, topic?.artistId, topic?.isArtist, topic?.id]);

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
    Alert.alert('Success', message);
  };

  const handleAddToFavorites = () => {
    Alert.alert('Add to Favorites', `"${selectedSong?.title}" added to your favorites!`);
  };

  const handleShare = () => {
    Alert.alert('Share', `Share "${selectedSong?.title}" by ${selectedSong?.artist}\n\nFeature coming soon!`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
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

        {/* Songs List */}
        <View style={styles.songsSection}>
          <Text style={styles.sectionTitle}>Top Song</Text>
          
          {loading ? (
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
              style={styles.loader}
            />
          ) : (
            songs.map((song, index) => (
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
            ))
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

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
