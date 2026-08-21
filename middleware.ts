import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Imports auth.config.ts only, not auth.ts, so bcrypt/DB access stays out of
// the Edge Runtime bundle this middleware runs in.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
};
