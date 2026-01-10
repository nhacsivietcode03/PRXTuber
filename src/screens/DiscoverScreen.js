// DiscoverScreen - Display all playlists/discover items
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BottomNavBar } from '../components';
import colors from '../theme/colors';
import { getPlaylists } from '../api/musicService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

const DiscoverScreen = ({ navigation }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Fetch all playlists
  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPlaylists(20); // Fetch more playlists
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      Alert.alert('Error', 'Could not load playlists. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Handlers
  const handleBack = () => {
    navigation.goBack();
  };

  const handlePlaylistPress = (playlist) => {
    navigation.navigate('TopicDetail', {
      topic: {
        id: playlist.id,
        title: playlist.title,
        image: playlist.image,
        genre: playlist.genre || null,
      }
    });
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigation.goBack();
    }
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => handlePlaylistPress(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.playlistImage}
        resizeMode="cover"
      />
      <Text style={styles.playlistTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.trackCount}>
        {item.trackCount || 0} tracks
      </Text>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Discover</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      {/* Playlists Grid */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          bounces={false}
          overScrollMode="never"
        />
      )}

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
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for BottomNavBar
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playlistItem: {
    width: ITEM_WIDTH,
  },
  playlistImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
    marginBottom: 8,
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  trackCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default DiscoverScreen;
