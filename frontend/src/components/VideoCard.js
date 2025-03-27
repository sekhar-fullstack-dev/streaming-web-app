import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import { useVideoContext } from '../context/VideoContext';

// Helper function to format bytes to readable size
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const VideoCard = ({ video }) => {
  const { playVideo } = useVideoContext();
  
  const handleClick = () => {
    playVideo(video.id);
  };

  return (
    <Card sx={{ maxWidth: 345, marginBottom: 2 }}>
      <CardActionArea onClick={handleClick}>
        <CardMedia
          component="div"
          sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.08)'
          }}
        >
          {video.thumbnailUrl ? (
            <img 
              src={`http://localhost:3000${video.thumbnailUrl}`}
              alt={video.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <MovieIcon sx={{ fontSize: 60, opacity: 0.6 }} />
          )}
        </CardMedia>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {video.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Size: {formatBytes(video.size)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Added: {formatDate(video.createdAt)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VideoCard;