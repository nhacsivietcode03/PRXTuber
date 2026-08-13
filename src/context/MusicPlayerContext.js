// MusicPlayerContext - Global state for music playback
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { usePlaylist } from './PlaylistContext';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const { isSongFavorite, toggleSongFavorite } = usePlaylist();
  
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  
  const soundRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Format time from milliseconds
  const formatTime = useCallback((millis) => {
    if (!millis || isNaN(millis)) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  // Playback status update callback
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setPosition(status.currentTime * 1000);
      setDuration((status.duration || 0) * 1000);
      setIsPlaying(status.playing);

      // Handle song end
      if (status.didJustFinish) {
        playNext();
      }
    }
  }, [playNext]);

  // Load and play audio
  const loadAudio = useCallback(async (audioUrl) => {
    try {
      setIsLoading(true);
      
      // Configure audio mode
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      });

      // Clean up previous sound and listener
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.remove();
        soundRef.current = null;
      }

      // Create new player
      const player = createAudioPlayer(audioUrl);
      soundRef.current = player;

      // Subscribe to status updates
      subscriptionRef.current = player.addListener('playbackStatusUpdate', (status) => {
        onPlaybackStatusUpdate(status);
      });

      player.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onPlaybackStatusUpdate]);

  // Play a song
  const playSong = useCallback((song, newPlaylist = []) => {
    if (!song) return;
    
    setCurrentSong(song);
    if (newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
    }
    
    if (song.audio) {
      loadAudio(song.audio);
    }
  }, [loadAudio]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  }, [isPlaying]);

  // Seek to position
  const seekTo = useCallback(async (value) => {
    if (soundRef.current) {
      await soundRef.current.seekTo(value / 1000);
    }
  }, []);

  // Get current song index
  const getCurrentIndex = useCallback(() => {
    return playlist.findIndex(item => item.id === currentSong?.id);
  }, [playlist, currentSong]);

  // Play next song
  const playNext = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1]);
    } else if (repeatMode === 1 && playlist.length > 0) {
      // Repeat all - go to first song
      playSong(playlist[0]);
    }
  }, [getCurrentIndex, playlist, repeatMode, playSong]);

  // Play previous song
  const playPrevious = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      playSong(playlist[currentIndex - 1]);
    } else if (repeatMode === 1 && playlist.length > 0) {
      // Repeat all - go to last song
      playSong(playlist[playlist.length - 1]);
    }
  }, [getCurrentIndex, playlist, repeatMode, playSong]);

  // Toggle favorite - add/remove from Favorites playlist
  const toggleFavorite = useCallback(() => {
    if (!currentSong) return;
    toggleSongFavorite(currentSong);
  }, [currentSong, toggleSongFavorite]);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => (prev + 1) % 3);
  }, []);

  // Stop playback
  const stop = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (soundRef.current) {
      soundRef.current.pause();
      soundRef.current.remove();
      soundRef.current = null;
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
      if (soundRef.current) {
        soundRef.current.remove();
      }
    };
  }, []);

  // Compute isFavorite based on current song
  const isFavorite = currentSong ? isSongFavorite(currentSong.id) : false;

  const value = {
    // State
    currentSong,
    playlist,
    isPlaying,
    isLoading,
    duration,
    position,
    progress,
    repeatMode,
    isFavorite,
    
    // Actions
    playSong,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
    toggleFavorite,
    toggleRepeat,
    stop,
    setPlaylist,
    
    // Utils
    formatTime,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export default MusicPlayerContext;
