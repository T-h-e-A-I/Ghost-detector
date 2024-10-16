# Secured Ghost Detection API

**Note:** All the frontend API calls now will have a Authorization header containing the access_token!

First install packages like **jwt** for access and refresh tokens to implement authorisation and authentication for ghosts.
Then install **redis** for faster access to user sessions as they are needed frequently.
We also need **bcrpyt** to hash human and ghost passwords.

Use this command to install these:

```bash
npm i jwt redis bcrypt
```

Import these packages:

```js
const jwt = require('jsonwebtoken');
const redis = require('redis');
const bcrypt = require('bcrypt')
```

The human auth flow is given below similar is needed for ghost too.

**Connect redis:**

```js
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.error('Redis connection error:', err));
redisClient.connect();
```

**Then assign secrets store them in .env then bring them**
- We keep the secrets in a .env file so that they are not exposed

```js
const HUMAN_ACCESS_SECRET = process.env.HUMAN_ACCESS_SECRET;
const HUMAN_REFRESH_SECRET = process.env.HUMAN_REFRESH_SECRET;
```

**We need a way to log them in so we need a login route:**
- search in the database for the user
- compare password hashes using bcrypt
- if ok, generate access and refresh tokens with proper validity
- save the session to redis

```js
app.post('/humans/login', async (req, res) => {
  try {
    const {userId, password} = req.body;
    const user = findHumanById(userId); // Need a database now to store them (we can use MongoDB, PostgreSQL, Supabase etc)
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) return res.status(403).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: userId }, HUMAN_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, HUMAN_REFRESH_SECRET, { expiresIn: '7d' });

    await redisClient.set(`human_session:${userId}`, accessToken, { EX: 900 }); 
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }   
}); 
```

**As access tokens expire fast in 15m and refresh tokens expire in 7d we need to get the access token from refresh route:**
- decode the refresh token
- check if the user's session exist in the redis cache
- send the newly generated access token to the user


```js
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
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

**An authHuman middleware code snippet is given we need a similar authGhost this will be provided before apis to authenticate them:**
- The middleware first checks for authorization header
- Then, we decode the JWT token from it
- Next, we check if redis has the user's session  

```js
const authHuman = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });


    const decoded = jwt.verify(token, HUMAN_ACCESS_SECRET);
    const sessionToken = await redisClient.get(`human_session:${decoded.id}`);
    if (!sessionToken || sessionToken !== token) {
      throw new Error('Invalid session');
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};
```

**Now, we add the authentication middleware to relevant routes:**

```js
app.post('/detect', authHuman, upload.single('image'), (req, res) => {}); // added the auth middleware
```

*We will add this authentication for all the human routes. The same will be done to the ghost routes.*

**A way to logout the human user is also implemented:**
- Delete the session from redis

```js
app.post('/humans/logout', authHuman, async (req, res) => {
  try {
    await redisClient.del(`human_session:${req.user.id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging out' });
  }
});
```

# Here is a github repo containing the authenticated version of the Ghost Detection API:
https://github.com/T-h-e-A-I/Ghost-detector/tree/main