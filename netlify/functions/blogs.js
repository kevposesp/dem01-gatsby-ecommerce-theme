import { neon } from '@netlify/neon';

const sql = neon();

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');

    let blogs;

    if (limitParam !== null) {
      const parsed = parseInt(limitParam, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return new Response(JSON.stringify({ error: 'Invalid `limit` parameter. Must be an integer >= 1.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const limit = Math.min(parsed, 1000);

      blogs = await sql('SELECT * FROM blogs ORDER BY created_at DESC LIMIT $1', [limit]);
    } else {
      blogs = await sql('SELECT * FROM blogs ORDER BY created_at DESC');
    }

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
