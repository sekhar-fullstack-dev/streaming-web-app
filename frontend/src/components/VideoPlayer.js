import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactPlayer from 'react-player';
import { useVideoContext } from '../context/VideoContext';
import { getVideoStreamUrl } from '../utils/api';

const VideoPlayer = () => {
  const { selectedVideo, clearSelectedVideo } = useVideoContext();

  if (!selectedVideo) {
    return null;
  }

  const videoUrl = getVideoStreamUrl(selectedVideo.id);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={clearSelectedVideo}
          sx={{ mb: 2 }}
        >
          Back to List
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {selectedVideo.title}
        </Typography>
        
        <Paper elevation={3} sx={{ backgroundColor: '#000', borderRadius: 2, overflow: 'hidden' }}>
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="auto"
            style={{ aspectRatio: '16/9' }}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  disablePictureInPicture: true,
                }
              }
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default VideoPlayer;