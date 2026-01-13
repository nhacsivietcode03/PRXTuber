// CreatePlaylistModal - Modal to create a new playlist
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import colors from '../theme/colors';

const CreatePlaylistModal = ({ visible, onClose, onCreate }) => {
  const [playlistName, setPlaylistName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset input when modal closes
      setPlaylistName('');
    }
  }, [visible]);

  const handleAdd = () => {
    if (playlistName.trim()) {
      onCreate(playlistName.trim());
      setPlaylistName('');
    }
  };

  const handleCancel = () => {
    setPlaylistName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          {/* Title */}
          <Text style={styles.title}>Create new playlist and add</Text>

          {/* Input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Enter playlist name"
            placeholderTextColor={colors.textMuted}
            value={playlistName}
            onChangeText={setPlaylistName}
            autoCapitalize="sentences"
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAdd}
              disabled={!playlistName.trim()}
            >
              <Text style={[
                styles.buttonText,
                styles.addButtonText,
                !playlistName.trim() && styles.buttonDisabled
              ]}>
                Add
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted,
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButtonText: {
    color: colors.primary,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default CreatePlaylistModal;
