const { sql } = require("@vercel/postgres");

async function migrate() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  )`;
  console.log("Migration ran successfully");
}

migrate().catch(console.error);
