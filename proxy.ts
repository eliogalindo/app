import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const protectedRoutes = ["/en-US/management", "/es-ES/management"];
const publicRoutes = [
  "/en-US/sign-in",
  "/es-ES/sign-in",
  "/en-US/sign-up",
  "/es-ES/sign-up",
  "/en-US/forgot-password",
  "/es-ES/forgot-password",
  "/en-US/password-reset",
  "/en-US/password-reset",
  "/en-US",
  "/es-ES",
];

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req: NextRequest) {
  // Skip middleware for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const response = intlMiddleware(req);

  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const session = req.cookies.get("session");
  const locale = req.nextUrl.pathname.split("/")[1] || routing.defaultLocale;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.nextUrl));
  }

  if (isPublicRoute && session && !req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(`/${locale}/admin`, req.nextUrl));
  }

  if (!session && req.nextUrl.pathname.startsWith(`/${locale}/admin`)) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.nextUrl));
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with /api, /trpc, /_next or /_vercel
  // - … the ones containing a dot (for example, favicon.ico)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
