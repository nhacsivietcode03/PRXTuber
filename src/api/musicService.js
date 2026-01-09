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
    
    return data?.results?.map(track => ({
      id: track.id,
      title: track.name,
      subtitle: track.artist_name,
      image: track.image,
      audio: track.audio,
    })) ?? [];
  } catch (error) {
    console.error('getHotTracks error:', error);
    return [];
  }
}

/**
 * Get playlists for Discover section
 * @param {number} limit - Number of playlists
 */
export async function getPlaylists(limit = 6) {
  try {
    const { data } = await jamendoClient.get('/playlists', {
      params: {
        limit,
        order: 'creationdate_desc',
        imagesize: 200,
      },
    });
    
    return data?.results?.map(playlist => ({
      id: playlist.id,
      title: playlist.name,
      trackCount: playlist.tracks_count || 0,
      image: playlist.image || 'https://via.placeholder.com/200',
      userId: playlist.user_id,
    })) ?? [];
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

export default {
  getTopTracks,
  getHotTracks,
  getPlaylists,
  searchTracks,
};
