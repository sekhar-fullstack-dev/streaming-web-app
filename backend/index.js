require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Then add this middleware after creating the express app and before other middleware:
app.use(cors());

// Videos directory path
const videosDir = path.join(__dirname, 'videos');

// Ensure videos directory exists
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log('Videos directory created');
}

/**
 * API 1: Get all videos
 * Returns a list of all videos with details
 */
app.get('/api/videos', (req, res) => {
  try {
    // Read the videos directory
    const files = fs.readdirSync(videosDir);
    
    // Get details for each video
    const videos = files
      .filter(file => {
        // Filter for video files (mp4, mov, etc.)
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(videosDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          id: path.parse(file).name, // Use filename without extension as id
          title: path.parse(file).name.replace(/-/g, ' '), // Replace dashes with spaces
          fileName: file,
          size: stats.size,
          url: `/api/videos/${path.parse(file).name}`, // URL to stream the video
          createdAt: stats.birthtime,
          duration: null, // Getting duration requires additional libraries
        };
      });
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting videos'
    });
  }
});

/**
 * API 2: Stream video by ID
 * Streams a video file with support for range requests
 */
app.get('/api/videos/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  
  try {
    // Find the video file with matching ID (filename without extension)
    const files = fs.readdirSync(videosDir);
    const videoFile = files.find(file => path.parse(file).name === videoId);
    
    if (!videoFile) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    const videoPath = path.join(videosDir, videoFile);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const videoExt = path.extname(videoFile).toLowerCase();
    
    // Set appropriate content type based on file extension
    const contentTypeMap = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm'
    };
    
    const contentType = contentTypeMap[videoExt] || 'video/mp4';
    
    // Handle range requests for video streaming
    const range = req.headers.range;
    
    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      // Create read stream for the specified range
      const fileStream = fs.createReadStream(videoPath, { start, end });
      
      // Set response headers for chunked streaming
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      
      // Pipe the file stream to response
      fileStream.pipe(res);
    } else {
      // No range requested, send the entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType
      });
      
      // Create read stream for the entire file
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while streaming video'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});