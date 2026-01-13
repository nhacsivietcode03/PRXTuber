// Music Service - Jamendo API endpoints
import jamendoClient from './jamendoClient';

/**
 * Get top/popular tracks
 * @param {number} limit - Number of tracks to fetch
 * @param {string} order - Order by: popularity_total, popularity_week, popularity_month
 */
export async function getTopTracks(limit = 10, order = 'popularity_total') {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        limit,
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
 * Get playlists/collections for Discover section
 * Using tracks with different tags to create "virtual playlists"
 * @param {number} limit - Number of items
 */
export async function getPlaylists(limit = 6) {
  try {
    // Fetch tracks from different genres to create discover collections
    const genres = ['electronic', 'pop', 'rock', 'jazz', 'hiphop', 'relaxation'];
    const results = [];
    
    // Gọi API tuần tự để tránh quá tải mạng
    for (const genre of genres.slice(0, limit)) {
      try {
        const { data } = await jamendoClient.get('/tracks', {
          params: {
            tags: genre,
            limit: 1,
            featured: 1,
            order: 'popularity_total',
            imagesize: 300,
          },
        });
        
        const track = data?.results?.[0];
        if (track) {
          results.push({
            id: `discover-${genre}`,
            title: genre.charAt(0).toUpperCase() + genre.slice(1) + ' Mix',
            subtitle: 'Popular tracks',
            trackCount: Math.floor(Math.random() * 50) + 20,
            image: track.image || track.album_image,
            genre: genre,
          });
        }
      } catch (genreError) {
        console.warn(`Failed to fetch ${genre} playlist:`, genreError.message);
        // Tiếp tục với genre tiếp theo
      }
    }

    return results;
  } catch (error) {
    console.error('getPlaylists error:', error);
    return [];
  }
}

/**
 * Search tracks by name
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 */
export async function searchTracks(query, limit = 20) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        search: query,
        limit,
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
 * @param {number} limit - Number of tracks
 * @param {string} order - Order by popularity
 */
export async function getTracksByGenre(genre, limit = 20, order = 'popularity_total') {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        tags: genre,
        limit,
        order,
        featured: 1, // Get featured tracks for better quality
        groupby: 'artist_id', // One track per artist to avoid duplicates
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
export async function getArtists(limit = 20) {
  try {
    const { data } = await jamendoClient.get('/artists', {
      params: {
        limit,
        order: 'popularity_total',
        imagesize: 200,
        hasimage: 'true', // Only get artists with images
      },
    });
    
    const defaultImage = 'https://via.placeholder.com/200/333333/02CDAC?text=Artist';
    
    return data?.results?.map(artist => ({
      id: artist.id,
      name: artist.name,
      // Check for empty string, null, undefined, or placeholder URLs
      image: (artist.image && artist.image.trim() !== '' && !artist.image.includes('default')) 
        ? artist.image 
        : defaultImage,
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
 * @param {number} limit - Number of tracks
 */
export async function getTracksByArtist(artistId, limit = 20) {
  try {
    const { data } = await jamendoClient.get('/tracks', {
      params: {
        artist_id: artistId,
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
  searchTracks,
  getGenres,
  getTracksByGenre,
  getTracksByGender,
  getTracksWithMusicInfo,
  getArtists,
  getTracksByArtist,
  GENRES,
};
