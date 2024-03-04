const { sql } = require("@vercel/postgres");

async function migrate() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS access_token (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    created TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'jst')
  );

  CREATE TABLE IF NOT EXISTS refresh_token (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    created TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'jst')
  );`;
  console.log("Migration ran successfully");
}

migrate().catch(console.error);
