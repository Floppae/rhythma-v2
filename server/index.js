import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
