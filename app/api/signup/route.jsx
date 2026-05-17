// app/api/signup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // service role — server-only, never expose to the client
);

const BCRYPT_COST = 12; // ~250ms on modern hardware; bump if your server is faster

export async function POST(req) {
    try {
        const body = await req.json();
        const { parentName, email, phone, poolLocation, password, kids } = body;

        // Basic server-side validation. Never trust the client.
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

        // Hash the password. bcrypt generates and embeds a unique salt automatically.
        const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

        // Insert the parent. Note the column is password_hash, NOT password.
        const { data: parent, error: parentErr } = await supabase
            .from("parents")
            .insert({
                name: parentName,
                email: email.toLowerCase().trim(),
                phone,
                address: poolLocation,
                password_hash: passwordHash,
            })
            .select("id")
            .single();

        if (parentErr) {
            // 23505 = unique_violation in Postgres — likely a duplicate email
            if (parentErr.code === "23505") {
                return NextResponse.json(
                    { error: "An account with that email already exists" },
                    { status: 409 }
                );
            }
            console.error("Parent insert failed:", parentErr);
            return NextResponse.json({ error: "Could not create account" }, { status: 500 });
        }

        // Insert kids linked to the parent
        const kidRows = kids.map((k) => ({
            parent_id: parent.id,
            name: k.name,
            age: parseInt(k.age, 10),
            swim_level: k.swimLevel,
        }));

        const { error: kidsErr } = await supabase.from("kids").insert(kidRows);
        if (kidsErr) {
            console.error("Kids insert failed:", kidsErr);
            // In production you'd want a transaction or cleanup of the parent row here
            return NextResponse.json({ error: "Could not save children" }, { status: 500 });
        }

        return NextResponse.json({ ok: true, parentId: parent.id });
    } catch (err) {
        console.error("Signup error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}