

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