import React from 'react';
import { Grid, Typography, Container, CircularProgress, Box, Alert } from '@mui/material';
import { useVideoContext } from '../context/VideoContext';
import VideoCard from './VideoCard';

const VideoList = () => {
  const { videos, loading, error } = useVideoContext();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No videos available. Add some videos to the videos directory to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Videos
      </Typography>
      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item key={video.id} xs={12} sm={6} md={4} lg={3}>
            <VideoCard video={video} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default VideoList;