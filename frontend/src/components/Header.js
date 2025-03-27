import React from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

const Header = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <VideoLibraryIcon sx={{ display: 'flex', mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            VIDEO STREAMER
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;