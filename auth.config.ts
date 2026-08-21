import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";

// Edge-safe: no bcrypt or DB imports here (middleware.ts runs on the Edge
// Runtime and imports this file, not auth.ts). Providers are added in auth.ts.
export default {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/api/admin")) {
        if (auth?.user?.role !== "admin") {
          return NextResponse.json(
            { error: auth ? "Forbidden" : "Unauthorized" },
            { status: auth ? 403 : 401 }
          );
        }
        return true;
      }

      if (pathname.startsWith("/admin")) {
        if (!auth) return false;
        if (auth.user?.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/dashboard")) {
        return !!auth;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
