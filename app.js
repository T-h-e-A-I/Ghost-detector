const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const redis = require('redis');

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const redisClient = redis.createClient();

app.use(bodyParser.json());

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

const HUMAN_ACCESS_SECRET = process.env.HUMAN_ACCESS_SECRET;
const HUMAN_REFRESH_SECRET = process.env.HUMAN_REFRESH_SECRET;
const GHOST_ACCESS_SECRET = process.env.GHOST_ACCESS_SECRET;
const GHOST_REFRESH_SECRET = process.env.GHOST_REFRESH_SECRET;

const authHuman = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, HUMAN_ACCESS_SECRET);
    const sessionToken = await redisClient.get(`human_session:${decoded.id}`);
    if (!sessionToken || sessionToken !== token) {
      throw new Error('Invalid session');
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Human authentication error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const authGhost = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, GHOST_ACCESS_SECRET);
    const sessionToken = await redisClient.get(`ghost_session:${decoded.id}`);
    if (!sessionToken || sessionToken !== token) {
      throw new Error('Invalid session');
    }
    req.ghost = decoded;
    next();
  } catch (error) {
    console.error('Ghost authentication error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

app.post('/humans/login', async (req, res) => {
  try {
    const userId = '123';
    const accessToken = jwt.sign({ id: userId }, HUMAN_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, HUMAN_REFRESH_SECRET, { expiresIn: '7d' });
    
    await redisClient.set(`human_session:${userId}`, accessToken, { EX: 900 });
    
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Human login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

app.post('/ghosts/login', async (req, res) => {
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

app.post('/humans/token', async (req, res) => {
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

app.post('/ghosts/token', async (req, res) => {
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

app.post('/humans/logout', authHuman, async (req, res) => {
  try {
    await redisClient.del(`human_session:${req.user.id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Human logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
});

app.post('/ghosts/logout', authGhost, async (req, res) => {
  try {
    await redisClient.del(`ghost_session:${req.ghost.id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Ghost logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
});

app.post('/detect', authHuman, upload.single('image'), (req, res) => {
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

app.get('/sightings', authHuman, (req, res) => {
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

app.get('/ghost-info', authHuman, (req, res) => {
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

app.get('/users', authHuman, (req, res) => {
    res.json({
        users: [
            { username: 'GhostHunter22', sightings_count: 5 },
            { username: 'SpookySeeker', sightings_count: 12 }
        ]
    });
});

app.post('/ghost/detect', authGhost, upload.single('image'), (req, res) => {
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

app.get('/spook-level', authHuman, (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location required' });
    }
    res.json({
        spook_level: 9,
        description: 'Extremely haunted. Watch your back!'
    });
});

app.get('/ghost/spooky-name', authGhost, (req, res) => {
    res.json({
        spooky_name: 'The Shadow Whisperer'
    });
});

app.get('/ghost/sightings', authGhost, (req, res) => {
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

app.get('/ghost/favorite-haunts', authGhost, (req, res) => {
    res.json({
        favorite_haunts: [
            { location: 'Old Lighthouse', scares_given: 15 },
            { location: 'Abandoned Hospital', scares_given: 20 }
        ]
    });
});

app.post('/spirit-guide', authHuman, (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question required' });
    }
    res.json({
        answer: "That's a bad idea... trust me."
    });
});

app.listen(3000, () => {
    console.log('Ghost-Detector API is running on port 3000');
});
