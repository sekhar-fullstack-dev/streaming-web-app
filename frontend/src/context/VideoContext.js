import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchVideos } from '../utils/api';

// Create the context
const VideoContext = createContext();

// Custom hook for using the context
export const useVideoContext = () => useContext(VideoContext);

// Provider component
export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch videos on component mount
  useEffect(() => {
    const getVideos = async () => {
      try {
        setLoading(true);
        const data = await fetchVideos();
        setVideos(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch videos. Please try again later.');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    getVideos();
  }, []);

  // Function to select a video for playing
  const playVideo = (videoId) => {
    const video = videos.find(v => v.id === videoId);
    setSelectedVideo(video);
  };

  // Function to clear the selected video
  const clearSelectedVideo = () => {
    setSelectedVideo(null);
  };

  // Context value
  const value = {
    videos,
    selectedVideo,
    loading,
    error,
    playVideo,
    clearSelectedVideo
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};