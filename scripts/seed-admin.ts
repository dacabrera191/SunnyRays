import { existsSync } from "node:fs";
import * as bcrypt from "bcrypt";
import { sql } from "@/lib/db";

// One-time bootstrap for the very first admin account. Role provisioning is
// otherwise admin-created-only (see app/api/admin/staff/route.ts), which is
// circular on a fresh database — this script is the escape hatch. Run with
// `npm run seed:admin`.

if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
}

const BCRYPT_COST = 12;

async function main() {
    const email = process.env.ADMIN_SEED_EMAIL;
    const password = process.env.ADMIN_SEED_PASSWORD;
    const name = process.env.ADMIN_SEED_NAME;

    if (!email || !password || !name) {
        console.error(
            "Missing ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, or ADMIN_SEED_NAME in the environment."
        );
        process.exit(1);
    }
    if (password.length < 8) {
        console.error("ADMIN_SEED_PASSWORD must be at least 8 characters.");
        process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await sql`
        SELECT id FROM parents WHERE LOWER(email) = ${normalizedEmail} LIMIT 1
    `;
    if (existing.length > 0) {
        console.log(`An account with ${normalizedEmail} already exists — nothing to do.`);
        return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    const rows = (await sql`
        INSERT INTO parents (name, email, phone, address, password_hash, role)
        VALUES (${name}, ${normalizedEmail}, '', '', ${passwordHash}, 'admin')
        RETURNING id
    `) as { id: number }[];

    console.log(`Seeded admin account ${normalizedEmail} (id ${rows[0].id}).`);
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    });
