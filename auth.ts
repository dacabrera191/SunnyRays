import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from "bcrypt";
import { sql } from "@/lib/db";
import authConfig from "@/auth.config";
import type { LoginParent } from "@/types/auth";

interface ParentRow extends LoginParent {
  password_hash: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const normalizedEmail = email.toLowerCase().trim();

        const rows = (await sql`
          SELECT id, name, email, role, password_hash
          FROM parents
          WHERE LOWER(email) = ${normalizedEmail}
          LIMIT 1
        `) as ParentRow[];

        if (rows.length === 0) {
          // Dummy compare so the response timing looks the same whether the
          // email exists or not — defeats timing-based account enumeration.
          await bcrypt.compare(password, "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalido");
          return null;
        }

        const parent = rows[0];
        const passwordOk = await bcrypt.compare(password, parent.password_hash);
        if (!passwordOk) return null;

        return {
          id: String(parent.id),
          name: parent.name,
          email: parent.email,
          role: parent.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
