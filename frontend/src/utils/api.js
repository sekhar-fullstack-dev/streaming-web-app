import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all videos
export const fetchVideos = async () => {
  try {
    const response = await api.get('/videos');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Get streaming URL for a video
export const getVideoStreamUrl = (videoId) => {
  return `${API_BASE_URL}/videos/${videoId}`;
};