import 'dotenv/config';
import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

async function migrate() {
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        alt TEXT,
        image TEXT,
        link TEXT,
        excerpt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

migrate();
