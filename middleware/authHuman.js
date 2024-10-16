const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient();
redisClient.connect();

const HUMAN_ACCESS_SECRET = process.env.HUMAN_ACCESS_SECRET;

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

module.exports = authHuman;

