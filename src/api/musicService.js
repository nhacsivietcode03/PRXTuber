// Music Service - Jamendo API endpoints
import jamendoClient from './jamendoClient';

/**
 * Get top/popular tracks
 * @param {number} limit - Number of tracks to fetch
 * @param {string} order - Order by: popularity_total, popularity_week, popularity_month
 */
export async function getTopTracks(limit = 10, order = 'popularity_total', offset = 0) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        limit,
        offset,
        order,
        include: 'musicinfo',
        imagesize: 200,
      },
    });

    return data?.results?.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id,
      image: track.image,
      audio: track.audio,
      audioDownload: track.audiodownload,
      duration: track.duration,
      albumName: track.album_name,
      albumId: track.album_id,
    })) ?? [];
  } catch (error) {
    console.error('getTopTracks error:', error);
    return [];
  }
}

/**
 * Get featured/hot tracks for banners
 * @param {number} limit - Number of tracks
 */
export async function getHotTracks(limit = 5) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        limit,
        order: 'popularity_week',
        featured: 1,
        imagesize: 400,
        include: 'musicinfo',
      },
    });

    return data?.results?.map(track => {
      // Get genre from musicinfo tags
      const genres = track.musicinfo?.tags?.genres || [];
      const firstGenre = genres[0] || null;

      return {
        id: track.id,
        title: track.name,
        subtitle: track.artist_name,
        artistId: track.artist_id,
        image: track.image,
        audio: track.audio,
        genre: firstGenre, // Add genre for topic filtering
        albumId: track.album_id,
      };
    }) ?? [];
  } catch (error) {
    console.error('getHotTracks error:', error);
    return [];
  }
}

/**
 * Get featured playlists from our own JSON file (app features)
 * Fallback to Jamendo playlists if it fails
 */
export async function getAppFeatures() {
  try {
    const { data } = await jamendoClient.get('https://prxtuber-26.web.app/features.json', {
      params: {} // Override default params if necessary, but jamendoClient has them global
    });
    
    return data.map(item => ({
      ...item,
      title: item.name ? item.name.replace(/&amp;/g, '&') : '',
      image: item.cover?.custom || item.cover?.big?.image1?.size600 || null,
      subtitle: 'Featured',
      originalId: item.id,
      type: 'playlist'
    }));
  } catch (error) {
    console.error('getAppFeatures error:', error);
    // Fallback logic will be handled in the caller (HomeScreen)
    return null;
  }
}

/**
 * Get playlists/collections for Discover section (previously Radio)
 * @param {number} limit - Number of items
 */
export async function getPlaylists(limit = 12) {
  try {
    // We use Jamendo's official curation account (user_id: 5276149) 
    // to fetch the same Featured Playlists reliably without 403 WAF errors.
    const { data } = await jamendoClient.get('/playlists', {
      params: {
        limit,
        user_id: 5276149,
        order: 'creationdate_desc'
      }
    });

    return data?.results?.map(playlist => {
      // Decode HTML entities
      const name = playlist.name.replace(/&amp;/g, '&');
      const imageUrl = `https://usercontent.jamendo.com?type=playlist&id=${playlist.id}&width=300`;

      return {
        id: `featured-${playlist.id}`,
        originalId: playlist.id,
        title: name,
        subtitle: 'Featured',
        trackCount: 0, // V3 playlist endpoint doesn't return track count directly
        image: imageUrl,
        genre: '',
        type: 'playlist',
      };
    }) || [];
  } catch (error) {
    console.error('getPlaylists error:', error);
    return [];
  }
}

/**
 * Get tracks by playlist ID
 * @param {string|number} playlistId - Playlist ID
 */
export async function getTracksByPlaylist(playlistId) {
  try {
    const { data } = await jamendoClient.get('/playlists/tracks', {
      params: {
        id: playlistId,
        limit: 50,
      },
    });

    // The response has results array where the first item contains tracks array
    if (data?.results?.[0]?.tracks) {
      return data.results[0].tracks.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artist_name,
        artistId: track.artist_id,
        image: track.image || track.album_image,
        audio: track.audio,
        duration: track.duration,
        albumName: track.album_name,
        albumId: track.album_id,
      }));
    }
    return [];
  } catch (error) {
    console.error('getTracksByPlaylist error:', error);
    return [];
  }
}

/**
 * Search tracks by name
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 */
export async function searchTracks(query, limit = 20, offset = 0) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        search: query,
        limit,
        offset,
        imagesize: 200,
      },
    });

    return data?.results?.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      image: track.image,
      audio: track.audio,
      duration: track.duration,
    })) ?? [];
  } catch (error) {
    console.error('searchTracks error:', error);
    return [];
  }
}

/**
 * Predefined featured genres from Jamendo
 * These are the main genres supported by Jamendo's featured system
 */
export const GENRES = [
  { id: 'pop', name: 'Pop', icon: 'musical-notes' },
  { id: 'rock', name: 'Rock', icon: 'flame' },
  { id: 'electronic', name: 'Electronic', icon: 'pulse' },
  { id: 'hiphop', name: 'Hip Hop', icon: 'mic' },
  { id: 'jazz', name: 'Jazz', icon: 'cafe' },
  { id: 'classical', name: 'Classical', icon: 'bonfire' },
  { id: 'metal', name: 'Metal', icon: 'skull' },
  { id: 'lounge', name: 'Lounge', icon: 'wine' },
  { id: 'relaxation', name: 'Relaxation', icon: 'leaf' },
  { id: 'soundtrack', name: 'Soundtrack', icon: 'film' },
  { id: 'world', name: 'World', icon: 'globe' },
  { id: 'songwriter', name: 'Singer-Songwriter', icon: 'person' },
];

/**
 * Get all available genres
 * Returns static list of Jamendo featured genres
 */
export function getGenres() {
  return GENRES;
}

/**
 * Get tracks by genre/tag
 * @param {string} genre - Genre tag (e.g., 'rock', 'pop', 'electronic')
 * @param {number} limit - Number of tracks (default 50 for better results)
 * @param {string} order - Order by popularity
 */
export async function getTracksByGenre(genre, limit = 50, order = 'popularity_total', offset = 0) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        tags: genre,
        limit,
        offset,
        order,
        featured: 1,
        groupby: 'artist_id',
        imagesize: 200,
        include: 'musicinfo',
      },
    });

    return data?.results?.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id,
      image: track.image,
      audio: track.audio,
      duration: track.duration,
      albumName: track.album_name,
      genre: genre,
      musicinfo: track.musicinfo,
    })) ?? [];
  } catch (error) {
    console.error('getTracksByGenre error:', error);
    return [];
  }
}

/**
 * Get tracks filtered by vocal gender (male/female singer)
 * @param {string} gender - 'male' or 'female'
 * @param {number} limit - Number of tracks
 */
export async function getTracksByGender(gender, limit = 20) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        gender: gender, // 'male' or 'female'
        vocalinstrumental: 'vocal', // Only vocal tracks have gender
        limit,
        order: 'popularity_total',
        imagesize: 200,
        include: 'musicinfo',
      },
    });

    return data?.results?.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id,
      image: track.image,
      audio: track.audio,
      duration: track.duration,
      gender: gender,
    })) ?? [];
  } catch (error) {
    console.error('getTracksByGender error:', error);
    return [];
  }
}

/**
 * Get tracks with music info (includes genres, instruments, vartags)
 * @param {number} limit - Number of tracks
 */
export async function getTracksWithMusicInfo(limit = 20) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        limit,
        order: 'popularity_total',
        include: 'musicinfo', // Include genres, instruments, vartags
        imagesize: 200,
      },
    });

    return data?.results?.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      image: track.image,
      audio: track.audio,
      duration: track.duration,
      musicinfo: {
        vocalinstrumental: track.musicinfo?.vocalinstrumental,
        gender: track.musicinfo?.gender,
        acousticelectric: track.musicinfo?.acousticelectric,
        speed: track.musicinfo?.speed,
        genres: track.musicinfo?.tags?.genres || [],
        instruments: track.musicinfo?.tags?.instruments || [],
        vartags: track.musicinfo?.tags?.vartags || [],
      },
    })) ?? [];
  } catch (error) {
    console.error('getTracksWithMusicInfo error:', error);
    return [];
  }
}

/**
 * Get artists for Discover section
 * @param {number} limit - Number of artists
 */
export async function getArtists(limit = 20, offset = 0) {
  try {
    const { data } = await jamendoClient.get('/artists', {
      params: {
        limit,
        offset,
        order: 'popularity_month',
        // imagesize: 200,
        hasimage: true,
      },
    });

    return data?.results?.map(artist => ({
      id: artist.id,
      name: artist.name,
      image: artist.image,
      website: artist.website,
      joindate: artist.joindate,
    })) ?? [];
  } catch (error) {
    console.error('getArtists error:', error);
    return [];
  }
}

/**
 * Get tracks by artist ID
 * @param {string|number} artistId - Artist ID
 * @param {number} limit - Number of tracks (default 50 for better results)
 */
export async function getTracksByArtist(artistId, limit = 50, offset = 0) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        artist_id: artistId,
        limit,
        offset,
        order: 'popularity_total',
        imagesize: 200,
        include: 'musicinfo',
      },
    });

    return data?.results?.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id,
      image: track.image,
      audio: track.audio,
      duration: track.duration,
      albumName: track.album_name,
    })) ?? [];
  } catch (error) {
    console.error('getTracksByArtist error:', error);
    return [];
  }
}

export default {
  getTopTracks,
  getHotTracks,
  getPlaylists,
  getTracksByPlaylist,
  searchTracks,
  getGenres,
  getTracksByGenre,
  getTracksByGender,
  getTracksWithMusicInfo,
  getArtists,
  getTracksByArtist,
  getAppFeatures,
  GENRES,
};
