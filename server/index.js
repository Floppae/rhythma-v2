import express from "express";
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

app.use(cors({ origin: [process.env.URL], credentials: true }));
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
});

db.connect();

app.post("/maps", async (req, res) => {
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

  //Authentication
  const auth = await db.query(
    "SELECT EXISTS (SELECT 1 FROM admins WHERE uid = $1)",
    [uid]
  );
  if (auth.rows[0].exists) {
    await db.query("INSERT INTO maps (user_id, map_link) VALUES ($1,$2)", [
      uid,
      mapLink,
    ]);
  }
});

app.delete("/delete", verifyIdToken, async (req, res) => {
  const { mapLink } = req.body;
  const uid = req.uid;

  //Authentication
  const auth = await db.query(
    "SELECT EXISTS (SELECT 1 FROM admins WHERE uid = $1)",
    [uid]
  );
  if (auth.rows[0].exists) {
    try {
      await db.query("DELETE FROM maps WHERE user_id = $1 AND map_link = $2", [
        uid,
        mapLink,
      ]);
      res.status(200).json({ message: "Entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
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

app.get("/getBeatmapDetails", async (req, res) => {
  //searchParams is a propety of URL object
  //searchParams allows us to use .get to grab parameters we set when we called this endpoint
  // const response = await axios.get("/getBeatmapDetails", {
  //   params: { beatmapSetId },
  // });
  //Now, we can do searchParams.get("beatmapSetId") to extract setId from the url
  const beatmapSetId = req.query.beatmapSetId;
  const uid = req.query.uid;
  const beatmapLink = req.query.beatmapLink;

  //Quick check to make sure we got the beatmapSetId
  if (!beatmapSetId) {
    res.json({ error: "Beatmap Retrieval Unsuccessful" }, { status: 404 });
  }

  const apiKey = process.env.OSU_API_KEY;
  //Initializing base url and parameters to access osu api
  const url = "https://osu.ppy.sh/api/get_beatmaps";
  const params = {
    k: apiKey,
    s: beatmapSetId,
  };

  try {
    //Running axios HTTP GET request with base url and parameters to get beatmap details
    const response = await axios.get(url, { params });
    const beatmap = response.data[0];

    //Checking if we successfully got the beatmap details
    if (beatmap) {
      return res.status(200).json({
        title: beatmap.title,
        creator: beatmap.creator,
        artist: beatmap.artist,
        coverUrl: `https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg`,
        uid: uid,
        beatmapLink: beatmapLink,
      });
    } else {
      return res.status(404).json({ error: "Beatmap Retrieval Unsuccessful" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port);
