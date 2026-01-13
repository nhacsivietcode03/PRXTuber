// MusicPlayerContext - Global state for music playback
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [isFavorite, setIsFavorite] = useState(false);
  
  const soundRef = useRef(null);

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
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      // Handle song end
      if (status.didJustFinish) {
        playNext();
      }
    }
  }, []);

  // Load and play audio
  const loadAudio = useCallback(async (audioUrl) => {
    try {
      setIsLoading(true);
      
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load new sound
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setDuration(status.durationMillis || 0);
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
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying]);

  // Seek to position
  const seekTo = useCallback(async (value) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
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

  // Toggle favorite
  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => (prev + 1) % 3);
  }, []);

  // Stop playback
  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
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
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

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
