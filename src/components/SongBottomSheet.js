// SongBottomSheet - Bottom sheet menu for song actions
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const { height, width } = Dimensions.get('window');

const SongBottomSheet = ({ 
  visible, 
  song, 
  onClose,
  onPlay,
  onAddToPlaylist,
  onAddToFavorites,
  onShare,
}) => {
  console.log('SongBottomSheet render:', { visible, song });
  
  if (!visible) return null;
  if (!song) {
    console.log('SongBottomSheet: song is null/undefined');
    return null;
  }

  const handleAction = (action) => {
    onClose();
    setTimeout(() => {
      action?.();
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.bottomSheet}>
          {/* Top Row: Heart - Album Cover - Share */}
          <View style={styles.topRow}>
            {/* Heart Icon */}
            <TouchableOpacity 
              style={styles.topIconButton}
              onPress={() => handleAction(onAddToFavorites)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="heart" size={20} color={colors.textPrimary} />
              </View>
            </TouchableOpacity>

            {/* Album Cover */}
            <Image 
              source={{ uri: song.image || 'https://via.placeholder.com/100' }}
              style={styles.albumCover}
            />

            {/* Share Icon */}
            <TouchableOpacity 
              style={styles.topIconButton}
              onPress={() => handleAction(onShare)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="arrow-redo" size={20} color={colors.textPrimary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Song Info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={2}>
              {song.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {song.artist}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Play */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAction(onPlay)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="play" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.actionText}>Play</Text>
            </TouchableOpacity>

            {/* Add to Playlist */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAction(onAddToPlaylist)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle-outline" size={18} color={colors.textPrimary} />
              </View>
              <Text style={styles.actionText}>Add to Playlist</Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  topIconButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCover: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.background,
    marginHorizontal: 20,
  },
  songInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4E4E',
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: colors.textPrimary,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default SongBottomSheet;
