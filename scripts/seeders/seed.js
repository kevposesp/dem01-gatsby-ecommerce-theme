require('dotenv/config');
const { neon } = require('@netlify/neon');
const blogData = require('../../src/helpers/blog.json');

const sql = neon(process.env.NETLIFY_DATABASE_URL);

async function seed() {
  try {
    for (const blog of blogData) {
      await sql(
        `INSERT INTO blogs (title, category, alt, image, link, excerpt) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [blog.title, blog.category, blog.alt, blog.image, blog.link, blog.excerpt]
      );
    }
    console.log(`Successfully seeded ${blogData.length} blogs`);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
