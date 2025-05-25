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

//caching data for uid's to optimize authorization process
let adminSet = new Set(); // Cache for admin UIDs

//Global Rate Limiting
let globalRequestCount = 0;
const globalRequestMax = 100;
const resetInterval = 60 * 1000;

//resets globalRequestCount after 1 minute
setInterval(() => {
  console.log("[RESETTING REQUEST COUNT]");
  globalRequestCount = 0;
}, resetInterval);

//Function to check API rate limits before calling osu API
async function osuApiRequest(url, params) {
  if (globalRequestCount >= globalRequestMax) {
    throw new Error(
      "Global rate limit exceeded for osu! API. Try again in 1 minute."
    );
  }

  globalRequestCount++;
  console.log(`[REQUESTS SENT]: ${globalRequestCount}`);
  try {
    console.log("[OSU API REQUEST] Sending request with params:", {
      url,
      beatmapSetId: params.s,
      apiKeyPresent: !!params.k,
    });

    const response = await axios.get(url, { params });
    console.log("[OSU API RESPONSE] Success:", {
      status: response.status,
      dataLength: response.data?.length,
      firstBeatmap: response.data?.[0] ? "Present" : "Not Present",
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error("[OSU API ERROR] Response error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        beatmapSetId: params.s,
        url: url,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("[OSU API ERROR] No response:", {
        request: error.request,
        beatmapSetId: params.s,
        url: url,
      });
    } else {
      // Error occurred during setup
      console.error("[OSU API ERROR] Setup error:", {
        message: error.message,
        beatmapSetId: params.s,
        url: url,
      });
    }

    // Re-throw with more context
    throw new Error(`Osu API Error for beatmap ${params.s}: ${error.message}`);
  }
}

//GET CACHE DATA
async function getCacheData(key) {
  const result = await db.query(
    "SELECT value FROM api_cache WHERE key = $1 AND expires_at > NOW()",
    [key]
  );
  return result.rows[0]?.value || null;
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
  windowMs: 60 * 1000,
  max: 200,
  message: "Too many requests to the osu! APi. Please try again in 1 minute.",
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

  // Add logging
  console.log("Received request:", {
    beatmapSetId,
    uid,
    beatmapLink,
  });

  //Quick check to make sure we got the beatmapSetId
  if (!beatmapSetId) {
    return res
      .status(404)
      .json({ error: "Beatmap Retrieval Unsuccessful - Missing beatmapSetId" });
  }

  const apiKey = process.env.OSU_API_KEY;
  if (!apiKey) {
    console.error("OSU_API_KEY is not set in environment variables");
    return res
      .status(500)
      .json({ error: "Server configuration error - Missing API key" });
  }

  //Initializing base url and parameters to access osu api
  const url = "https://osu.ppy.sh/api/get_beatmaps";
  const params = {
    k: apiKey,
    s: beatmapSetId,
  };

  try {
    //Check cache for beatmap details
    const cacheKey = `set${beatmapSetId.toString()}`;
    const cachedData = await getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Log the API request
    console.log("Making API request with params:", {
      url,
      beatmapSetId,
      hasApiKey: !!apiKey,
    });

    //Running axios HTTP GET request with base url and parameters to get beatmap details
    const response = await osuApiRequest(url, params);

    //If we get a response, we can set the beatmap details to the cache for 1 hour
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
      await setCacheData(cacheKey, result, 3600); //1 hour ttl
      return res.status(200).json(result);
    } else {
      return res.status(404).json({
        error: "Beatmap Retrieval Unsuccessful - No beatmap data found",
      });
    }
  } catch (error) {
    console.error("Error in getBeatmapDetails:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    if (error.response) {
      return res.status(error.response.status).json({
        error: "Osu API Error",
        details: error.response.data,
      });
    }

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
