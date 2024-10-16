const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authHuman = require('../middleware/authHuman');
const upload = require('../middleware/multer');
const redis = require('redis');

const redisClient = redis.createClient();
redisClient.connect();

const HUMAN_ACCESS_SECRET = process.env.HUMAN_ACCESS_SECRET;
const HUMAN_REFRESH_SECRET = process.env.HUMAN_REFRESH_SECRET;

router.post('/login', async (req, res) => {
  try {
    const userId = '123'; // This should be replaced with actual user authentication logic
    const accessToken = jwt.sign({ id: userId }, HUMAN_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, HUMAN_REFRESH_SECRET, { expiresIn: '7d' });
    
    await redisClient.set(`human_session:${userId}`, accessToken, { EX: 900 });
    
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Human login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, HUMAN_REFRESH_SECRET);
    const sessionExists = await redisClient.exists(`human_session:${decoded.id}`);
    
    if (!sessionExists) {
      return res.status(401).json({ error: 'Session expired, please log in again' });
    }

    const newAccessToken = jwt.sign({ id: decoded.id }, HUMAN_ACCESS_SECRET, { expiresIn: '15m' });
    
    await redisClient.set(`human_session:${decoded.id}`, newAccessToken, { EX: 900 });
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Human token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authHuman, async (req, res) => {
  try {
    await redisClient.del(`human_session:${req.user.id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Human logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
});

router.post('/detect', authHuman, upload.single('image'), (req, res) => {
    const { latitude, longitude } = req.body;
    if (!req.file || !latitude || !longitude) {
        return res.status(400).json({ error: 'Image and location required' });
    }
    res.json({
        ghost_detected: true,
        ghost_type: 'Poltergeist',
        bounding_box: {
            x: 120,
            y: 80,
            width: 200,
            height: 200
        }
    });
});

router.get('/sightings', authHuman, (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location required' });
    }
    res.json({
        sightings: [
            { ghost_type: 'Banshee', location: '13 Haunted Lane', time: '02:00 AM' },
            { ghost_type: 'Wraith', location: 'Old Cemetery', time: '03:15 AM' }
        ]
    });
});

router.get('/ghost-info', authHuman, (req, res) => {
    const { ghost_type } = req.query;
    if (!ghost_type) {
        return res.status(400).json({ error: 'Ghost type required' });
    }
    res.json({
        ghost_type: 'Poltergeist',
        favorite_food: 'Cold pizza',
        favorite_time_of_night: '2:00 AM',
        typical_age: '300 years',
        origin: 'Medieval Europe',
        description: 'A mischievous spirit known for moving objects and causing trouble.'
    });
});

router.get('/users', authHuman, (req, res) => {
    res.json({
        users: [
            { username: 'GhostHunter22', sightings_count: 5 },
            { username: 'SpookySeeker', sightings_count: 12 }
        ]
    });
});

router.get('/spook-level', authHuman, (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location required' });
    }
    res.json({
        spook_level: 9,
        description: 'Extremely haunted. Watch your back!'
    });
});

router.post('/spirit-guide', authHuman, (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question required' });
    }
    res.json({
        answer: "That's a bad idea... trust me."
    });
});

module.exports = router;
