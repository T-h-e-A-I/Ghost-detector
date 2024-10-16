const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient();
redisClient.connect();

const GHOST_ACCESS_SECRET = process.env.GHOST_ACCESS_SECRET;

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

module.exports = authGhost;

