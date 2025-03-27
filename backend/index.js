require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Then add this middleware after creating the express app and before other middleware:
app.use(cors());

// Videos directory path
const videosDir = path.join(__dirname, "videos");

// Ensure videos directory exists
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log("Videos directory created");
}

// Add these to the top of your index.js file along with other requires
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// Create thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(__dirname, "thumbnails");
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Function to generate a thumbnail for a video
const generateThumbnail = (videoPath, videoId) => {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(thumbnailsDir, `${videoId}.jpg`);

    // Check if thumbnail already exists
    if (fs.existsSync(thumbnailPath)) {
      return resolve(`/api/thumbnails/${videoId}.jpg`);
    }

    ffmpeg(videoPath)
      .on("end", () => {
        resolve(`/api/thumbnails/${videoId}.jpg`);
      })
      .on("error", (err) => {
        console.error(`Error generating thumbnail for ${videoId}:`, err);
        reject(err);
      })
      .screenshots({
        count: 1,
        folder: thumbnailsDir,
        filename: `${videoId}.jpg`,
        size: "320x180", // 16:9 aspect ratio thumbnail
      });
  });
};

// Add route to serve thumbnails
app.get("/api/thumbnails/:filename", (req, res) => {
  const thumbnailPath = path.join(thumbnailsDir, req.params.filename);

  // Check if the thumbnail exists
  if (!fs.existsSync(thumbnailPath)) {
    return res.status(404).send("Thumbnail not found");
  }

  // Send the thumbnail file
  res.sendFile(thumbnailPath);
});

// Modify your existing /api/videos endpoint to include thumbnails
app.get("/api/videos", async (req, res) => {
  try {
    const videosDir = path.join(__dirname, "videos");
    const files = fs.readdirSync(videosDir);

    // Get video metadata
    const videoPromises = files.map(async (file) => {
      const videoPath = path.join(videosDir, file);
      const stats = fs.statSync(videoPath);

      // Generate a unique video ID (using filename without extension)
      const videoId = path.basename(file, path.extname(file));

      try {
        // Generate or get thumbnail path
        const thumbnailUrl = await generateThumbnail(videoPath, videoId);

        return {
          id: videoId,
          title: path.basename(file),
          size: stats.size,
          path: file,
          createdAt: stats.birthtime,
          thumbnailUrl: thumbnailUrl,
        };
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
        // Return video without thumbnail if there's an error
        return {
          id: videoId,
          title: path.basename(file),
          size: stats.size,
          path: file,
          createdAt: stats.birthtime,
          thumbnailUrl: null,
        };
      }
    });

    const videos = await Promise.all(videoPromises);

    res.json({
      status: "success",
      data: videos,
    });
  } catch (error) {
    console.error("Error retrieving videos:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve videos",
    });
  }
});

/**
 * API 2: Stream video by ID
 * Streams a video file with support for range requests
 */
app.get("/api/videos/:videoId", (req, res) => {
  const videoId = req.params.videoId;

  try {
    // Find the video file with matching ID (filename without extension)
    const files = fs.readdirSync(videosDir);
    const videoFile = files.find((file) => path.parse(file).name === videoId);

    if (!videoFile) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const videoPath = path.join(videosDir, videoFile);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const videoExt = path.extname(videoFile).toLowerCase();

    // Set appropriate content type based on file extension
    const contentTypeMap = {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".mkv": "video/x-matroska",
      ".webm": "video/webm",
    };

    const contentType = contentTypeMap[videoExt] || "video/mp4";

    // Handle range requests for video streaming
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // Create read stream for the specified range
      const fileStream = fs.createReadStream(videoPath, { start, end });

      // Set response headers for chunked streaming
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });

      // Pipe the file stream to response
      fileStream.pipe(res);
    } else {
      // No range requested, send the entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
      });

      // Create read stream for the entire file
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(500).json({
      success: false,
      message: "Server error while streaming video",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
