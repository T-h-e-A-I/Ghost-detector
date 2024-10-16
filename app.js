const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const redis = require('redis');
const humanRoutes = require('./routes/human.routes');
const ghostRoutes = require('./routes/ghost.routes');

dotenv.config();

const app = express();
const redisClient = redis.createClient();

app.use(bodyParser.json());

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Use the routes
app.use('/humans', humanRoutes);
app.use('/ghosts', ghostRoutes);

app.listen(3000, () => {
    console.log('Ghost-Detector API is running on port 3000');
});
