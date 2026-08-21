import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import type { StaffPayload } from "@/types/staff";

const BCRYPT_COST = 12;

function isUniqueViolation(err: unknown): boolean {
    return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body: StaffPayload = await req.json();
        const { name, email, phone, password, role } = body;

        if (!name || !email || !phone || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (role !== "instructor" && role !== "admin") {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

        try {
            const rows = await sql`
                INSERT INTO parents (name, email, phone, address, password_hash, role)
                VALUES (${name}, ${normalizedEmail}, ${phone}, '', ${passwordHash}, ${role})
                RETURNING id
            ` as { id: number }[];

            return NextResponse.json({ ok: true, id: rows[0].id });
        } catch (err) {
            if (isUniqueViolation(err)) {
                return NextResponse.json(
                    { error: "An account with that email already exists" },
                    { status: 409 }
                );
            }
            console.error("Staff insert failed:", err);
            return NextResponse.json({ error: "Could not create account" }, { status: 500 });
        }
    } catch (err) {
        console.error("Staff provisioning error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
