import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware: Processing request for:", pathname);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/dashboard/*"];

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/auth/callback"];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  console.log(
    "Middleware: Protected route:",
    isProtectedRoute,
    "Public route:",
    isPublicRoute,
  );

  // If trying to access protected route without auth, redirect to login
  if (isProtectedRoute) {
    console.log("Middleware: Redirecting to login - no auth found");
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieStore,
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If authenticated user tries to access public routes (login/register), redirect to dashboard
  if (isPublicRoute) {
    console.log("Middleware: User is authenticated, redirecting to dashboard");
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieStore,
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  console.log("Middleware: Allowing access to:", pathname);
  // Continue to the requested route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the following:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
