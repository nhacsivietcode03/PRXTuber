// PlaylistDetailScreen - Display songs in a user playlist (matching Figma design)
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { BottomNavBar } from '../components';
import colors from '../theme/colors';
import { usePlaylist, useMusicPlayer } from '../context';

const PlaylistDetailScreen = ({ route, navigation }) => {
  const { playlist } = route.params || {};
  const [activeTab, setActiveTab] = useState('favorites');
  const [showPlaylistOptions, setShowPlaylistOptions] = useState(false);
  const [showSongOptions, setShowSongOptions] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  
  const { 
    getPlaylist, 
    removeSongFromPlaylist, 
    deletePlaylist, 
    renamePlaylist,
    playlists,
    addSongToPlaylist,
  } = usePlaylist();
  const { playSong } = useMusicPlayer();
  
  // Get fresh playlist data from context
  const currentPlaylist = getPlaylist(playlist?.id) || playlist;
  const songs = (currentPlaylist?.songs || []).filter(song => song && song.id);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Auto refresh from context
    }, [playlists])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigation.navigate('Home');
    } else if (tabId === 'discover') {
      navigation.navigate('Discover');
    } else if (tabId === 'favorites') {
      navigation.navigate('Favorites');
    } else if (tabId === 'settings') {
      navigation.navigate('Settings');
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
      navigation.navigate('Play', { song: songs[0], playlist: songs });
    }
  };

  const handleAddSong = () => {
    // Navigate to search to add songs
    navigation.navigate('Search', { addToPlaylist: currentPlaylist });
  };

  const handleSongPress = (song, index) => {
    navigation.navigate('Play', { song, playlist: songs });
  };

  const handleSongMore = (song) => {
    setSelectedSong(song);
    setShowSongOptions(true);
  };

  // Playlist Options
  const handleRenamePlaylist = () => {
    setShowPlaylistOptions(false);
    setNewName(currentPlaylist?.name || '');
    setShowRenameModal(true);
  };

  const confirmRename = () => {
    if (newName.trim() && currentPlaylist) {
      renamePlaylist(currentPlaylist.id, newName.trim());
      setShowRenameModal(false);
      setNewName('');
    }
  };

  const handleDeletePlaylist = () => {
    setShowPlaylistOptions(false);
    Alert.alert(
      'Remove Playlist',
      `Are you sure you want to delete "${currentPlaylist?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deletePlaylist(currentPlaylist?.id);
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleSharePlaylist = () => {
    setShowPlaylistOptions(false);
    Alert.alert('Share', 'Share playlist feature coming soon!');
  };

  // Song Options
  const handleAddToAnotherPlaylist = () => {
    setShowSongOptions(false);
    // Show playlist selection
    const otherPlaylists = playlists.filter(p => p.id !== currentPlaylist?.id);
    if (otherPlaylists.length === 0) {
      Alert.alert('No Playlists', 'Create another playlist first');
      return;
    }
    
    Alert.alert(
      'Add to Playlist',
      'Select a playlist:',
      otherPlaylists.map(p => ({
        text: p.name,
        onPress: () => {
          addSongToPlaylist(p.id, selectedSong);
          Alert.alert('Added', `"${selectedSong?.title}" added to "${p.name}"`);
        }
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const handleShareSong = () => {
    setShowSongOptions(false);
    Alert.alert('Share', `Share "${selectedSong?.title}" - Coming soon!`);
  };

  const handleRemoveFromPlaylist = () => {
    setShowSongOptions(false);
    if (selectedSong && currentPlaylist) {
      removeSongFromPlaylist(currentPlaylist.id, selectedSong.id);
    }
  };

  const renderSongItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => handleSongPress(item, index)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/50' }}
        style={styles.songImage}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => handleSongMore(item)}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>There is no song in your playlist</Text>
      <TouchableOpacity 
        style={styles.addSongButton}
        onPress={handleAddSong}
      >
        <Ionicons name="add" size={18} color={colors.textPrimary} />
        <Text style={styles.addSongButtonText}>Add song</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Playlist Icon */}
      <View style={styles.playlistIconContainer}>
        <View style={styles.playlistIcon}>
          <Ionicons name="musical-notes" size={48} color={colors.primary} />
        </View>
      </View>

      {/* Play All Button */}
      {songs.length > 0 && (
        <TouchableOpacity 
          style={styles.playAllButton}
          onPress={handlePlayAll}
        >
          <Ionicons name="play" size={18} color={colors.textPrimary} />
          <Text style={styles.playAllText}>Play all</Text>
        </TouchableOpacity>
      )}

      {/* Add Song Option */}
      <TouchableOpacity 
        style={styles.addSongRow}
        onPress={handleAddSong}
      >
        <View style={styles.addSongIcon}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </View>
        <Text style={styles.addSongText}>Add song</Text>
      </TouchableOpacity>
    </View>
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
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentPlaylist?.name || 'Play list name'}
          </Text>
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={() => setShowPlaylistOptions(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Content */}
      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={(item, index) => item?.id?.toString() || `song-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
      />

      {/* Playlist Options Modal */}
      <Modal
        visible={showPlaylistOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlaylistOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlaylistOptions(false)}
        >
          <View style={styles.bottomSheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{currentPlaylist?.name}</Text>
              <View style={styles.sheetDivider} />
            </View>

            {/* Options */}
            <TouchableOpacity style={styles.sheetOption} onPress={() => {
              setShowPlaylistOptions(false);
              Alert.alert('Add Photo', 'Feature coming soon!');
            }}>
              <Ionicons name="image-outline" size={22} color={colors.textPrimary} />
              <Text style={styles.sheetOptionText}>Add playlist photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handleRenamePlaylist}>
              <Ionicons name="pencil-outline" size={22} color={colors.textPrimary} />
              <Text style={styles.sheetOptionText}>Rename playlist</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handleAddSong}>
              <Ionicons name="add-circle-outline" size={22} color={colors.textPrimary} />
              <Text style={styles.sheetOptionText}>Add song</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handleSharePlaylist}>
              <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
              <Text style={styles.sheetOptionText}>Share playlist</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handleDeletePlaylist}>
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.sheetOptionText, { color: '#FF6B6B' }]}>Remove playlist</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Song Options Modal */}
      <Modal
        visible={showSongOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSongOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSongOptions(false)}
        >
          <View style={styles.bottomSheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle} numberOfLines={1}>{selectedSong?.title}</Text>
              <Text style={styles.sheetSubtitle}>{selectedSong?.artist}</Text>
              <View style={styles.sheetDivider} />
            </View>

            {/* Options */}
            <TouchableOpacity style={styles.sheetOption} onPress={handleAddToAnotherPlaylist}>
              <Ionicons name="add-circle-outline" size={22} color={colors.textPrimary} />
              <Text style={styles.sheetOptionText}>Add to another playlist</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handleShareSong}>
              <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
              <Text style={styles.sheetOptionText}>Share song</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handleRemoveFromPlaylist}>
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.sheetOptionText, { color: '#FF6B6B' }]}>Remove from playlist</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.renameModalOverlay}>
          <View style={styles.renameModalContent}>
            <Text style={styles.renameModalTitle}>Rename Playlist</Text>
            <TextInput
              style={styles.renameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.renameButtons}>
              <TouchableOpacity onPress={() => setShowRenameModal(false)}>
                <Text style={styles.renameCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRename}>
                <Text style={styles.renameConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  optionsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  playlistIconContainer: {
    marginBottom: 24,
  },
  playlistIcon: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    gap: 8,
    marginBottom: 24,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 12,
    gap: 12,
  },
  addSongIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSongText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  addSongButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: 6,
  },
  addSongButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  // Bottom Sheet styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  sheetDivider: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    marginTop: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  sheetOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  // Rename Modal
  renameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameModalContent: {
    width: '80%',
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 24,
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  renameInput: {
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 20,
  },
  renameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  renameCancelText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  renameConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default PlaylistDetailScreen;
