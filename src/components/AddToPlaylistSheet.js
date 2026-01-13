// AddToPlaylistSheet - Bottom sheet to add song to playlist
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { usePlaylist } from '../context/PlaylistContext';
import CreatePlaylistModal from './CreatePlaylistModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AddToPlaylistSheet = ({ visible, song, onClose, onSuccess }) => {
  const { playlists, addSongToPlaylist, createPlaylist } = usePlaylist();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Don't render if no song
  if (!song || !song.id) {
    return null;
  }

  const handleSelectPlaylist = (playlist) => {
    if (!playlist || !playlist.id) return;
    addSongToPlaylist(playlist.id, song);
    onSuccess?.(`Added to "${playlist.name}"`);
    onClose();
  };

  const handleCreateNewPlaylist = () => {
    setShowCreateModal(true);
  };

  const handleCreatePlaylist = (name) => {
    const newPlaylist = createPlaylist(name);
    if (newPlaylist && newPlaylist.id) {
      // Add song to the newly created playlist after a short delay
      setTimeout(() => {
        addSongToPlaylist(newPlaylist.id, song);
      }, 100);
    }
    setShowCreateModal(false);
    onSuccess?.(`Created "${name}" and added song`);
    onClose();
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handleSelectPlaylist(item)}
      activeOpacity={0.7}
    >
      <View style={styles.playlistIcon}>
        <MaterialCommunityIcons name="music-note" size={24} color={colors.primary} />
      </View>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistCount}>
          {item.songs?.length || 0} songs
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Handle bar */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* Title */}
              <Text style={styles.title}>Add to playlist</Text>

              {/* Create new playlist button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateNewPlaylist}
                activeOpacity={0.7}
              >
                <View style={styles.createIcon}>
                  <Ionicons name="add" size={24} color={colors.background} />
                </View>
                <Text style={styles.createText}>Create new playlist</Text>
              </TouchableOpacity>

              {/* Playlist list */}
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={renderPlaylistItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePlaylist}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
    paddingBottom: 30,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: 16,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  playlistIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: {
    marginLeft: 16,
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default AddToPlaylistSheet;
