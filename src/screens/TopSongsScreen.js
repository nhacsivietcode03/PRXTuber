// TopSongsScreen - Display all top songs
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { SongItem, NowPlayingBar, BottomNavBar, SongBottomSheet, AddToPlaylistSheet } from '../components';
import colors from '../theme/colors';
import { getTopTracks } from '../api/musicService';
import { useMusicPlayer } from '../context';

const TopSongsScreen = ({ navigation }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSong, setSelectedSong] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // Use global music player context
  const { currentSong, playSong } = useMusicPlayer();

  // Fetch all top songs
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const tracks = await getTopTracks(50); // Fetch more songs
      setSongs(tracks);
    } catch (error) {
      console.error('Error fetching top songs:', error);
      Alert.alert('Error', 'Could not load songs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Handlers
  const handleBack = () => {
    navigation.goBack();
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

  const handleMorePress = (song) => {
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
    Alert.alert('Success', message);
  };

  const handleAddToFavorites = () => {
    Alert.alert('Add to Favorites', `"${selectedSong?.title}" added to your favorites!`);
  };

  const handleShare = () => {
    Alert.alert('Share', `Share "${selectedSong?.title}" by ${selectedSong?.artist}\n\nFeature coming soon!`);
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigation.goBack();
    }
  };

  const renderSongItem = ({ item, index }) => (
    <SongItem
      id={item.id}
      title={item.title}
      artist={item.artist}
      image={item.image}
      song={item}
      isPlaying={item.id === currentSong?.id}
      isCurrentSong={item.id === currentSong?.id}
      onPress={() => handleSongPress(item, index)}
      onMorePress={() => handleMorePress(item)}
    />
  );

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
          <Text style={styles.headerTitle}>Top song</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      {/* Songs List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          bounces={false}
          overScrollMode="never"
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
  placeholder: {
    width: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 160, // Space for NowPlayingBar + BottomNavBar
  },
});

export default TopSongsScreen;
