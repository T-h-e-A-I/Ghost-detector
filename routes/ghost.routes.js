const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authGhost = require('../middleware/authGhost');
const upload = require('../middleware/multer');
const redis = require('redis');

const redisClient = redis.createClient();
redisClient.connect();

const GHOST_ACCESS_SECRET = process.env.GHOST_ACCESS_SECRET;
const GHOST_REFRESH_SECRET = process.env.GHOST_REFRESH_SECRET;

router.post('/login', async (req, res) => {
  try {
    const ghostId = '456';
    const accessToken = jwt.sign({ id: ghostId }, GHOST_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: ghostId }, GHOST_REFRESH_SECRET, { expiresIn: '7d' });
    
    await redisClient.set(`ghost_session:${ghostId}`, accessToken, { EX: 900 });
    
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Ghost login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, GHOST_REFRESH_SECRET);
    const sessionExists = await redisClient.exists(`ghost_session:${decoded.id}`);
    
    if (!sessionExists) {
      return res.status(401).json({ error: 'Session expired, please log in again' });
    }

    const newAccessToken = jwt.sign({ id: decoded.id }, GHOST_ACCESS_SECRET, { expiresIn: '15m' });
    
    await redisClient.set(`ghost_session:${decoded.id}`, newAccessToken, { EX: 900 });
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Ghost token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authGhost, async (req, res) => {
  try {
    await redisClient.del(`ghost_session:${req.ghost.id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Ghost logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
});

router.post('/detect', authGhost, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image required' });
    }
    res.json({
        human_detected: true,
        human_age: 29,
        human_identity: 'John Doe',
        spook_level: 'Terrified'
    });
});

router.get('/spooky-name', authGhost, (req, res) => {
    res.json({
        spooky_name: 'The Shadow Whisperer'
    });
});

router.get('/sightings', authGhost, (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location required' });
    }
    res.json({
        human_sightings: [
            { human_name: 'Jane Smith', location: 'Haunted Mansion', time: '10:00 PM' },
            { human_name: 'Bob the Builder', location: 'Spooky Forest', time: '11:45 PM' }
        ]
    });
});

router.get('/favorite-haunts', authGhost, (req, res) => {
    res.json({
        favorite_haunts: [
            { location: 'Old Lighthouse', scares_given: 15 },
            { location: 'Abandoned Hospital', scares_given: 20 }
        ]
    });
});

module.exports = router;

