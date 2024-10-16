# Ghost-Detector API 🎃👻

### Welcome, fearless humans (and sneaky ghosts)!

Halloween is here, and with it comes the most important question of our time: Are there ghosts lurking around, watching your every move? Worry no more, because **Ghost-Detector** has you covered! Whether you're a human trying to avoid spectral surprises or a ghost in need of some human hunting, this API has everything you need. This cutting-edge (and definitely *not* haunted) service is the perfect solution to detect spooky spirits or to give ghosts some much-needed help in avoiding humans (we can be scarier than they think).

---

## Documentation

### Input Format for Image and Coordinates:
- **Image**: The image file should be sent as `multipart/form-data`. Supported formats include JPEG and PNG.
- **Coordinates**: The user’s location (latitude and longitude) must be sent in the request body as a JSON object with the keys `latitude` and `longitude`.

---

### 1. `/detect` - Detect a Ghost 👻

**Endpoint (Human Version):** `/detect`

**Description:**  
Upload an image and provide your location to detect whether a ghost is present. If detected, the API will return the type of ghost and its bounding box.

**Request:**
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `image`: The image file (JPEG, PNG).
  - `location`: A JSON object containing the user's location (latitude and longitude).

**Example Request:**
```json
{
  "location": {
    "latitude": 40.712776,
    "longitude": -74.005974
  }
}
```

**Example cURL Command:**
```bash
curl -X POST "https://ghost-detector.com/detect" \
-F "image=@haunted-house.jpg" \
-F "location={\"latitude\": 40.712776, \"longitude\": -74.005974}"
```

**Response:**
```json
{
  "ghost_detected": true,
  "ghost_type": "Poltergeist",
  "bounding_box": {
    "x": 120,
    "y": 80,
    "width": 200,
    "height": 200
  }
}
```

---

### 2. `/sightings` - Nearby Ghost Sightings 👀

**Endpoint (Human Version):** `/sightings`

**Description:**  
Provide your current location to get a list of recent ghost sightings within a 100-meter radius. Great for planning your next haunted adventure—or avoiding it.

**Request:**
- **Method:** `GET`
- **Content-Type:** `application/json`
- **Parameters:**
  - `location`: A JSON object containing the user's current location (latitude and longitude).

**Example Request:**
```json
{
  "location": {
    "latitude": 40.712776,
    "longitude": -74.005974
  }
}
```

**Response:**
```json
{
  "sightings": [
    {
      "ghost_type": "Banshee",
      "location": "13 Haunted Lane",
      "time": "02:00 AM"
    },
    {
      "ghost_type": "Wraith",
      "location": "Old Cemetery",
      "time": "03:15 AM"
    }
  ]
}
```

---

### 3. `/ghost-info` - Ghost Details 🕵️‍♂️

**Endpoint (Human Version):** `/ghost-info`

**Description:**  
Provide the type of ghost you're curious about, and get detailed information such as its favorite haunting time, origin story, and spooky trivia.

**Request:**
- **Method:** `GET`
- **Content-Type:** `application/json`
- **Parameters:**
  - `ghost_type`: The type of ghost to look up (e.g., "Poltergeist").

**Example Request:**
```json
{
  "ghost_type": "Poltergeist"
}
```

**Response:**
```json
{
  "ghost_type": "Poltergeist",
  "favorite_food": "Cold pizza",
  "favorite_time_of_night": "2:00 AM",
  "typical_age": "300 years",
  "origin": "Medieval Europe",
  "description": "A mischievous spirit known for moving objects and causing trouble."
}
```

---

### 4. `/users` - Human Users List 🧑‍💻

**Endpoint (Human Version):** `/users`

**Description:**  
List all the brave humans using Ghost-Detector, along with how many ghost sightings they’ve reported.

**Request:**
- **Method:** `GET`
- **Content-Type:** `application/json`

**Example Request:**
(No body required for this request)

**Response:**
```json
{
  "users": [
    {
      "username": "GhostHunter22",
      "sightings_count": 5
    },
    {
      "username": "SpookySeeker",
      "sightings_count": 12
    }
  ]
}
```

---

### 5. `/ghost/detect` - Detect a Human 🧟‍♂️

**Endpoint (Ghost Version):** `/ghost/detect`

**Description:**  
For the ghostly folks out there—this works the same as the `/detect` endpoint for humans, but instead detects humans in a ghost's image. Ever wondered if there’s a human around you? Now you’ll know!

**Request:**
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `image`: The spooky image (JPEG, PNG).
  - No coordinates required (ghosts don’t need GPS).

**Example cURL Command:**
```bash
curl -X POST "https://ghost-detector.com/ghost/detect" \
-F "image=@haunted-house.jpg"
```

**Response:**
```json
{
  "human_detected": true,
  "human_age": 29,
  "human_identity": "John Doe",
  "spook_level": "Terrified"
}
```

---

### 6. `/spook-level` - Check Spookiness of an Area

**Description:**  
This endpoint allows users (both human and ghost) to check how haunted a particular area is. The result is a "spook level" on a scale from 1 to 10.

**Request:**
- **Method:** `GET`
- **Content-Type:** `application/json`
- **Parameters:**
  - `location`: The location to check spookiness (latitude and longitude).

**Example Request:**
```json
{
  "location": {
    "latitude": 51.507351,
    "longitude": -0.127758
  }
}
```

**Response:**
```json
{
  "spook_level": 9,
  "description": "Extremely haunted. Watch your back!"
}
```

---

### 7. `/ghost/spooky-name` - Generate a Spooky Name

**Description:**  
For ghosts who need a cool new haunting alias, this endpoint generates a spooky name for their next haunting gig.

**Request:**
- **Method:** `GET`
- **Content-Type:** `application/json`

**Example Request:**
(No body required for this request)

**Response:**
```json
{
  "spooky_name": "The Shadow Whisperer"
}
```

---

### 8. `/ghost/sightings` - Track Human Sightings

**Description:**  
This one’s for the ghosts! This endpoint lets them track how many humans have been spotted in their haunting grounds.

**Request:**
- **Method:** `GET`
- **Content-Type:** `application/json`
- **Parameters:**
  - `location`: The ghost's current location (latitude, longitude).

**Example Request:**
```json
{
  "location": {
    "latitude": 51.507351,
    "longitude": -0.127758
  }
}
```

**Response:**
```json
{
  "human_sightings": [
    {
      "human_name": "Jane Smith",
      "location": "Haunted Mansion",
      "time": "10:00 PM"
    },
    {
      "human_name": "Bob the Builder",
      "location": "Spooky Forest",
      "time": "11:45 PM"
    }
  ]
}
```

---

### 9. `/ghost/favorite-haunts` - Track Favorite Haunting Spots

**Description:**  
For the nostalgic ghost who loves revisiting their favorite haunts, this endpoint helps them track the places they've scared the most humans.

**Request:**
- **Method:** `GET`
- **Content-Type:** `application/json`

**Example Request:**
(No body required for this request)

**Response:**
```json
{
  "favorite_haunts": [
    {
      "location": "Old Lighthouse",
      "scares_given": 15
    },
    {
      "location": "Abandoned Hospital",
      "scares_given": 20
    }
  ]
}
```

---

### 10. `/spirit-guide` - Summon a Spirit Guide for Help

**Description:**  
Got a deep, spooky question about life, death, or why ghosts are obsessed with Victorian houses? This endpoint lets ghosts (or brave humans) summon a spirit guide for existential advice.

**Request:**
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Parameters:**
  - `question`: Your question for the spirit

 guide (e.g., "Why are haunted dolls always so creepy?").

**Example Request:**
```json
{
  "question": "What happens if a ghost crosses the streams?"
}
```

**Response:**
```json
{
  "answer": "That's a bad idea... trust me."
}
```

---

### Happy Hauntings! 🎃👻

And there you have it, the **Ghost-Detector** API. Whether you're a human trying to avoid ghosts or a ghost trying to keep tabs on humans, we’ve got you covered! Just remember, don't cross the streams... 👀
