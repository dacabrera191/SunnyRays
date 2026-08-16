// app/api/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const rows = await sql`
            SELECT id, name, email, password_hash
            FROM parents
            WHERE LOWER(email) = ${normalizedEmail}
            LIMIT 1
        `;

        // Use the same generic error message whether the email exists or not,
        // so an attacker can't probe which emails are registered.
        const genericError = { error: "Invalid email or password" };

        if (rows.length === 0) {
            // Still run a bcrypt compare against a dummy hash so the response
            // time looks similar to a real verification — defeats timing attacks.
            await bcrypt.compare(password, "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalido");
            return NextResponse.json(genericError, { status: 401 });
        }

        const parent = rows[0];
        const passwordOk = await bcrypt.compare(password, parent.password_hash);

        if (!passwordOk) {
            return NextResponse.json(genericError, { status: 401 });
        }

        // Login succeeded. At this point you'd typically set a session cookie
        // or issue a JWT. For now we just return the parent's info.
        return NextResponse.json({
            ok: true,
            parent: { id: parent.id, name: parent.name, email: parent.email },
        });
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}