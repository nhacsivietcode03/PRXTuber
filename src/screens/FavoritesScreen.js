// FavoritesScreen - Display user's playlists (matching Figma design)
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { BottomNavBar } from '../components';
import colors from '../theme/colors';
import { usePlaylist } from '../context';

const FavoritesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { playlists, createPlaylist } = usePlaylist();

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Data is automatically updated from context
    }, [])
  );

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigation.navigate('Home');
    } else if (tabId === 'discover') {
      navigation.navigate('Discover');
    } else if (tabId === 'search') {
      navigation.navigate('Search');
    } else if (tabId === 'settings') {
      navigation.navigate('Settings');
    }
  };

  const handlePlaylistPress = (playlist) => {
    navigation.navigate('PlaylistDetail', { playlist });
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handleCancelCreate = () => {
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const getPlaylistIcon = (index) => {
    // Different icons for variety
    const icons = ['heart', 'musical-notes', 'disc', 'albums', 'radio'];
    const iconColors = [colors.primary, '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];
    return {
      icon: icons[index % icons.length],
      color: iconColors[index % iconColors.length],
    };
  };

  const renderPlaylistItem = ({ item, index }) => {
    const { icon, color } = getPlaylistIcon(index);
    const isFirst = index === 0;
    
    return (
      <TouchableOpacity 
        style={styles.playlistItem}
        onPress={() => handlePlaylistPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.playlistIcon, { backgroundColor: isFirst ? color + '20' : colors.backgroundCard }]}>
          <Ionicons 
            name={isFirst ? 'heart' : 'musical-notes'} 
            size={24} 
            color={isFirst ? color : colors.primary} 
          />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playlistSongs}>
            {item.songs?.length || 0} songs
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderEmptyPlaylists = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-notes-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Playlists Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap + to create your first playlist
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Playlist</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle-outline" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Playlist List */}
      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyPlaylists}
      />

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelCreate}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Playlist</Text>
            
            {/* Playlist Icon Preview */}
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIcon}>
                <Ionicons name="musical-notes" size={40} color={colors.primary} />
              </View>
            </View>

            {/* Input Field */}
            <Text style={styles.inputLabel}>Create new playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter playlist name"
              placeholderTextColor={colors.textMuted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelCreate}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  playlistSongs: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalIconContainer: {
    marginBottom: 24,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default FavoritesScreen;
