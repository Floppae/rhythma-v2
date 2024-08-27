import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.DB_PORT;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: port,
});

db.connect();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
