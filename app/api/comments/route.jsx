// File: app/api/comments/route.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// GET /api/comments — list all comments
export async function GET() {
    try {
        const rows = await sql`
      SELECT id, comment, created_at
      FROM comments
      ORDER BY created_at DESC
      LIMIT 50
    `;
        return Response.json({ ok: true, comments: rows });
    } catch (err) {
        return Response.json({ ok: false, error: err.message }, { status: 500 });
    }
}

// POST /api/comments — add a new comment
export async function POST(request) {
    try {
        const { comment } = await request.json();
        if (!comment || typeof comment !== 'string' || !comment.trim()) {
            return Response.json(
                { ok: false, error: 'Comment is required' },
                { status: 400 }
            );
        }

        const rows = await sql`
      INSERT INTO comments (comment)
      VALUES (${comment.trim()})
      RETURNING id, comment, created_at
    `;
        return Response.json({ ok: true, comment: rows[0] }, { status: 201 });
    } catch (err) {
        return Response.json({ ok: false, error: err.message }, { status: 500 });
    }
}