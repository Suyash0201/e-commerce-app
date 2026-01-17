const express = require("express");
const { Pool } = require("pg");
const Redis = require("ioredis");

const app = express();
const port = 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redis = new Redis(process.env.REDIS_URL);

app.get("/", async (req, res) => {
  res.send("Backend API is running 🚀");
});

app.get("/products", async (req, res) => {
  const cached = await redis.get("products");
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const result = await pool.query("SELECT * FROM products");
  await redis.set("products", JSON.stringify(result.rows), "EX", 60);
  res.json(result.rows);
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});