const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
require('dotenv').config();

const app = express();

// Use memory storage for GAE compatibility
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google Vision client
const client = new vision.ImageAnnotatorClient();

// Serve static HTML form
app.use(express.static('views'));

// Handle image upload
app.post('/upload', upload.single('pic'), async (req, res) => {
  try {
    const [result] = await client.labelDetection({
      image: { content: req.file.buffer }
    });

    const labels = result.labelAnnotations;

    res.send(`
      <h2>Detected Labels:</h2>
      <ul>${labels.map(l => `<li>${l.description}</li>`).join('')}</ul>
      <a href="/">Upload another image</a>
    `);
  } catch (err) {
    console.error('Error during label detection:', err);
    res.status(500).send('Image analysis failed: ' + err.message);
  }
});

// Start the server (GAE will use PORT env variable)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
