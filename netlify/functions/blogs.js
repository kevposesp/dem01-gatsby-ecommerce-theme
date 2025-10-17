import { neon } from '@netlify/neon';

const sql = neon();

export default async (req, context) => {
  try {
    const blogs = await sql('SELECT * FROM blogs ORDER BY created_at DESC');

    return new Response(JSON.stringify(blogs), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch blogs' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config = {
  path: '/api/blogs',
};
