import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());
const port = 4000;

const db = new pg.Client({
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
    console.error("Error fetching maps:", error);
    res.status(500).send("Server error");
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
    console.error("Error fetching admins:", error);
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
  const { searchParams } = new URL(request.url);
  const beatmapSetId = searchParams.get("beatmapSetId");

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
      return res.json(
        {
          title: beatmap.title,
          creator: beatmap.creator,
          artist: beatmap.artist,
          coverUrl: `https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg`,
        },
        { status: 200 }
      );
    } else {
      return res.json(
        { error: "Beatmap Retrieval Unsuccessful" },
        { status: 404 }
      );
    }
  } catch (error) {
    return res.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
