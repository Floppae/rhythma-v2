import express from "express";
import rateLimit from "express-rate-limit";
// import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import admin from "firebase-admin";
// import service from "./service.json" assert { type: "json" };
import { body, validationResult } from "express-validator";

dotenv.config({ path: ".env.local" });

const app = express();

// Trust proxy - required when running behind a reverse proxy like Render
app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://www.rhythma.net"],
    credentials: true, // If you need to send cookies or credentials
  })
);
app.use(express.json());
const port = process.env.SERVER_PORT;

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
  }),
});

const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
  ssl: {
    rejectUnauthorized: false, // Use true if using a trusted certificate
  },
});

db.connect();

// Add after db.connect();
db.query(
  `
  CREATE TABLE IF NOT EXISTS beatmap_details (
    beatmap_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    creator VARCHAR(255),
    artist VARCHAR(255),
    cover_url TEXT
  );
`
).catch((err) => console.error("Error creating beatmap_details table:", err));

//caching data for uid's to optimize authorization process
let adminSet = new Set(); // Cache for admin UIDs

//Function to make osu API requests
async function osuApiRequest(url, params) {
  try {
    console.log("[OSU API REQUEST] Sending request with params:", {
      url,
      beatmapSetId: params.s,
      apiKeyPresent: !!params.k,
    });

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("[OSU API ERROR]:", {
      message: error.message,
      beatmapSetId: params.s,
      url: url,
      response: error.response?.data,
    });
    throw error;
  }
}

//GET CACHE DATA
async function getCacheData(key) {
  const result = await db.query(
    "SELECT value FROM api_cache WHERE key = $1 AND expires_at > NOW()",
    [key]
  );
  try {
    // Parse the JSON string from the database
    return result.rows[0]?.value ? JSON.parse(result.rows[0].value) : null;
  } catch (error) {
    console.error("Error parsing cached data:", error);
    return null;
  }
}

//SET CACHE DATA
async function setCacheData(key, value, ttlSeconds) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  await db.query(
    "INSERT INTO api_cache (key,value,expires_at) VALUES ($1,$2,$3) ON CONFLICT (key) DO UPDATE SET value = $2, expires_at = $3",
    [key, JSON.stringify(value), expiresAt]
  );
}

//OSU API RATE LIMITER Middleware
const osuApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // increased from 200 to handle more concurrent users
  message: "Too many requests to the osu! API. Please try again in 1 minute.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use a combination of IP and UID for rate limiting
    return req.query.uid ? `${req.ip}-${req.query.uid}` : req.ip;
  },
});

// Preload Admins at Startup
async function preloadAdmins() {
  try {
    const result = await db.query("SELECT uid FROM admins");
    adminSet = new Set(result.rows.map((row) => row.uid));
  } catch (error) {
    console.error("Error preloading admin UIDs:", error);
  }
}

// Utility to Check Admin Status
function isAdmin(uid) {
  return adminSet.has(uid); // Constant-time lookup
}

app.post("/maps", osuApiLimiter, async (req, res) => {
  //grabs maps and takes uid as argument
  //returns
  // {
  //   id: int,
  //   user_id: varchar,
  //   map_link: varchar
  // }

  const { uid } = req.body;
  try {
    const allMaps = await db.query("SELECT * FROM maps WHERE user_id = $1", [
      uid,
    ]);
    res.json(allMaps.rows);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.get("/getAllMaps", osuApiLimiter, async (req, res) => {
  try {
    const allEntries = await db.query("SELECT * FROM maps");
    res.status(200).json(allEntries.rows);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

//middleware for incoming map modification requests
async function verifyIdToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    //verify token with firebase (Verifies the token was signed/distributed by firebase)
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden" });
  }
}

//add map
//Request goes through input sanitization and token verification before querying database
app.post("/add", [body("mapLink").isURL()], verifyIdToken, async (req, res) => {
  const start = Date.now();
  //Input sanitization
  //If the middleware that checks if the maplink is a url throws an error, it will be collected in errors array
  //If errors is not empty, there was an error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array });
  }

  const { mapLink } = req.body;

  //req.uid is from middleware
  const uid = req.uid;
  console.log(`[AUTH] Verifying admin: ${Date.now() - start}ms`);

  //Authentication
  const authStart = Date.now();
  if (!isAdmin(uid)) {
    return res.status(403).json({ error: "User not authorized" });
  }
  console.log(`[AUTH] Query executed in ${Date.now() - authStart}ms`);

  const insertStart = Date.now();
  try {
    await db.query("INSERT INTO maps (user_id, map_link) VALUES ($1,$2)", [
      uid,
      mapLink,
    ]);
    console.log(`[INSERT] Query executed in ${Date.now() - insertStart}ms`);

    return res.status(200).json("Success");
  } catch (error) {
    if ((error.code = "23505")) {
      return res.status(400).json({ error: "Map already exists" });
    }
  }

  console.log(`[END] /add completed in ${Date.now() - start}ms`);
});

app.delete("/delete", verifyIdToken, async (req, res) => {
  const { mapLink } = req.body;
  const uid = req.uid;

  //Authentication
  if (!isAdmin(uid)) {
    return res.status(403).json({ error: "User not authorized" });
  }

  try {
    await db.query("DELETE FROM maps WHERE user_id = $1 AND map_link = $2", [
      uid,
      mapLink,
    ]);
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admins", async (req, res) => {
  //grabs employee uid
  //returns
  // [
  //   {
  //     uid: "exampleUID",
  //   },
  //   {
  //     uid: "exampleUID",
  //   },
  // ];
  try {
    const admins = await db.query("SELECT uid FROM admins");
    res.json(admins.rows);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.get("/getBeatmapDetails", osuApiLimiter, async (req, res) => {
  const beatmapSetId = req.query.beatmapSetId;
  const uid = req.query.uid;
  const beatmapLink = req.query.beatmapLink;

  if (!beatmapSetId) {
    return res.status(404).json({ error: "Missing beatmapSetId" });
  }

  try {
    // First try to get from database
    const dbResult = await db.query(
      "SELECT * FROM beatmap_details WHERE beatmap_id = $1",
      [beatmapSetId]
    );

    // If found in database, return it
    if (dbResult.rows.length > 0) {
      const details = dbResult.rows[0];
      return res.status(200).json({
        title: details.title,
        creator: details.creator,
        artist: details.artist,
        coverUrl: details.cover_url,
        uid: uid,
        beatmapLink: beatmapLink.split(":")[0],
      });
    }

    // If not in database, get from API
    const apiKey = process.env.OSU_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const response = await osuApiRequest(
      "https://osu.ppy.sh/api/get_beatmaps",
      {
        k: apiKey,
        s: beatmapSetId,
      }
    );

    if (response.length > 0) {
      const beatmap = response[0];
      const result = {
        title: beatmap.title,
        creator: beatmap.creator,
        artist: beatmap.artist,
        coverUrl: `https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg`,
        uid: uid,
        beatmapLink: beatmapLink.split(":")[0],
      };

      // Store in database for future use
      await db.query(
        `INSERT INTO beatmap_details (beatmap_id, title, creator, artist, cover_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (beatmap_id) DO UPDATE SET
         title = EXCLUDED.title,
         creator = EXCLUDED.creator,
         artist = EXCLUDED.artist,
         cover_url = EXCLUDED.cover_url`,
        [
          beatmapSetId,
          beatmap.title,
          beatmap.creator,
          beatmap.artist,
          result.coverUrl,
        ]
      );

      return res.status(200).json(result);
    }

    return res.status(404).json({ error: "No beatmap data found" });
  } catch (error) {
    console.error("Error in getBeatmapDetails:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

preloadAdmins();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
