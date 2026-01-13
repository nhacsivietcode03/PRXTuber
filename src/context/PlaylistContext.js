// PlaylistContext - Manage user playlists
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlaylistContext = createContext();

const PLAYLISTS_STORAGE_KEY = '@prxtuber_playlists';

// Default playlists for demo
const DEFAULT_PLAYLISTS = [
  { id: '1', name: 'My morning tracks', songs: [] },
  { id: '2', name: 'Random song', songs: [] },
  { id: '3', name: 'Chill songs', songs: [] },
  { id: '4', name: 'Sun set songs', songs: [] },
];

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within PlaylistProvider');
  }
  return context;
};

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState(DEFAULT_PLAYLISTS);
  const [isLoading, setIsLoading] = useState(true);

  // Load playlists from storage on mount
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Ensure each playlist has a songs array
          const validPlaylists = parsed.map(p => ({
            ...p,
            songs: p.songs || []
          }));
          setPlaylists(validPlaylists);
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFromStorage();
  }, []);

  // Load playlists from storage
  const loadPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (stored) {
        setPlaylists(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save playlists to storage
  const savePlaylists = useCallback(async (newPlaylists) => {
    try {
      await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }, []);

  // Create new playlist
  const createPlaylist = useCallback((name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      songs: [],
      createdAt: new Date().toISOString(),
    };
    
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = [newPlaylist, ...prevPlaylists];
      savePlaylists(updatedPlaylists);
      return updatedPlaylists;
    });
    
    return newPlaylist;
  }, [savePlaylists]);

  // Add song to playlist
  const addSongToPlaylist = useCallback((playlistId, song) => {
    // Validate inputs
    if (!playlistId || !song || !song.id) {
      console.warn('addSongToPlaylist: Invalid playlistId or song', { playlistId, song });
      return;
    }

    setPlaylists(prevPlaylists => {
      const updatedPlaylists = prevPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          // Ensure songs array exists
          const currentSongs = playlist.songs || [];
          // Check if song already exists
          const songExists = currentSongs.some(s => s && s.id === song.id);
          if (songExists) {
            return playlist;
          }
          return {
            ...playlist,
            songs: [...currentSongs, song],
          };
        }
        return playlist;
      });
      
      // Save to storage
      savePlaylists(updatedPlaylists);
      return updatedPlaylists;
    });
  }, [savePlaylists]);

  // Remove song from playlist
  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    if (!playlistId || !songId) return;
    
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = prevPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          const currentSongs = playlist.songs || [];
          return {
            ...playlist,
            songs: currentSongs.filter(s => s && s.id !== songId),
          };
        }
        return playlist;
      });
      
      savePlaylists(updatedPlaylists);
      return updatedPlaylists;
    });
  }, [savePlaylists]);

  // Delete playlist
  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = prevPlaylists.filter(p => p.id !== playlistId);
      savePlaylists(updatedPlaylists);
      return updatedPlaylists;
    });
  }, [savePlaylists]);

  // Rename playlist
  const renamePlaylist = useCallback((playlistId, newName) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = prevPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          return { ...playlist, name: newName.trim() };
        }
        return playlist;
      });
      
      savePlaylists(updatedPlaylists);
      return updatedPlaylists;
    });
  }, [savePlaylists]);

  // Get playlist by ID
  const getPlaylist = useCallback((playlistId) => {
    return playlists.find(p => p.id === playlistId);
  }, [playlists]);

  // Check if song is in playlist
  const isSongInPlaylist = useCallback((playlistId, songId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.songs.some(s => s.id === songId) || false;
  }, [playlists]);

  const value = {
    playlists,
    isLoading,
    loadPlaylists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    renamePlaylist,
    getPlaylist,
    isSongInPlaylist,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
