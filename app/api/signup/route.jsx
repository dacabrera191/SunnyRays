// app/api/signup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const BCRYPT_COST = 12; // ~250ms on modern hardware

export async function POST(req) {
    try {
        const body = await req.json();
        const { parentName, email, phone, poolLocation, password, kids } = body;

        // Server-side validation — never trust the client
        if (!parentName || !email || !phone || !poolLocation || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }
        if (!Array.isArray(kids) || kids.length === 0) {
            return NextResponse.json({ error: "At least one child is required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Hash the password. bcrypt generates and embeds a unique salt automatically.
        const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

        // Insert the parent and get back the new id
        let parentRows;
        try {
            parentRows = await sql`
                INSERT INTO parents (name, email, phone, address, password_hash)
                VALUES (${parentName}, ${normalizedEmail}, ${phone}, ${poolLocation}, ${passwordHash})
                RETURNING id
            `;
        } catch (err) {
            // 23505 = unique_violation (duplicate email)
            if (err.code === "23505") {
                return NextResponse.json(
                    { error: "An account with that email already exists" },
                    { status: 409 }
                );
            }
            console.error("Parent insert failed:", err);
            return NextResponse.json({ error: "Could not create account" }, { status: 500 });
        }

        const parentId = parentRows[0].id;

        // Insert kids one at a time. The neon() tagged-template driver runs each
        // call as a separate HTTP request, so we just loop. If any kid fails,
        // we roll back by deleting the parent (the CASCADE handles any kids
        // that did get inserted).
        try {
            for (const kid of kids) {
                const age = parseInt(kid.age, 10);
                await sql`
                    INSERT INTO kids (parent_id, name, age, swim_level)
                    VALUES (${parentId}, ${kid.name}, ${age}, ${kid.swimLevel})
                `;
            }
        } catch (err) {
            console.error("Kids insert failed:", err);
            await sql`DELETE FROM parents WHERE id = ${parentId}`;
            return NextResponse.json({ error: "Could not save children" }, { status: 500 });
        }

        return NextResponse.json({ ok: true, parentId });
    } catch (err) {
        console.error("Signup error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}