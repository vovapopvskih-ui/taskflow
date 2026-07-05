import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify",
  "/reset-password",
  "/auth/callback",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and API routes without auth check
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const supabase = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in and tries to access auth pages → redirect to dashboard
  if (
    user &&
    ["/login", "/register", "/forgot-password"].some((route) =>
      pathname.startsWith(route),
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Если маршрут публичный — пропускаем без проверки авторизации
  const isPublic = PUBLIC_ROUTES.some(
    (route) => route === "/" ? pathname === "/" : pathname.startsWith(route),
  );

  // If user is NOT logged in and tries to access protected routes → redirect to login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
