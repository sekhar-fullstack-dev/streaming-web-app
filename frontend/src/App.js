import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { VideoProvider, useVideoContext } from './context/VideoContext';
import Header from './components/Header';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Main content component
const MainContent = () => {
  const { selectedVideo } = useVideoContext();
  
  return (
    <>
      <Header />
      {selectedVideo ? <VideoPlayer /> : <VideoList />}
    </>
  );
};

// App component with providers
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VideoProvider>
        <MainContent />
      </VideoProvider>
    </ThemeProvider>
  );
}

export default App;