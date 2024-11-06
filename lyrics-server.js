//lyrics-server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Genius API access token 
const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

// Test the token when server starts
async function testApiConnection() {
  try {
    const response = await axios.get('https://api.genius.com/search', {
      headers: {
        'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
      },
      params: { q: 'test' }
    });
    console.log('Successfully connected to Genius API');
  } catch (error) {
    console.error('Error connecting to Genius API:', error.response?.data || error.message);
    console.error('Please check your API token');
  }
}

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { songTitle, artistName } = req.query;

    console.log(`Searching for: ${songTitle} by ${artistName}`);

    const response = await axios.get('https://api.genius.com/search', {
      headers: {
        'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
      },
      params: { q: songTitle }
    });

    const hits = response.data.response.hits;

    if (hits.length === 0) {
      return res.status(404).json({ error: 'No songs found' });
    }

    for (let hit of hits) {
      const hitArtistName = hit.result.primary_artist.name.toLowerCase();
      if (!artistName || hitArtistName.includes(artistName.toLowerCase())) {
        return res.json({
          url: hit.result.url,
          title: hit.result.title,
          artist: hit.result.primary_artist.name
        });
      }
    }

    res.status(404).json({ error: 'Song not found' });
  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error searching for song',
      details: error.response?.data?.error || error.message
    });
  }
});

// Lyrics endpoint
app.get('/api/lyrics', async (req, res) => {
  try {
    const { url } = req.query;
    const response = await axios.get(url);

    // Use cheerio to parse the HTML and extract lyrics
    const cheerio = require('cheerio');
    const $ = cheerio.load(response.data);

    let lyrics = '';
    $('[data-lyrics-container="true"]').each((i, elem) => {
      lyrics += $(elem).text() + '\n';
    });

    if (!lyrics) {
      return res.status(404).json({ error: 'Lyrics not found' });
    }

    res.json({ lyrics: lyrics.trim() });
  } catch (error) {
    console.error('Lyrics error:', error.message);
    res.status(500).json({ error: 'Error fetching lyrics' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:3000`);
  testApiConnection();  // Test API connection on startup
});