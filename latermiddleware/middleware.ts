import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  // Debug: show cookie names and whether tokens are present (no values)
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  console.log("[middleware] cookies seen", {
    count: cookieNames.length,
    names: cookieNames,
    hasAccess: cookieNames.some((n) => n.includes("access-token")),
    hasRefresh: cookieNames.some((n) => n.includes("refresh-token")),
  });

  // Debug: session presence
  console.log("[middleware] session check", {
    pathname,
    hasSession: !!session,
    userId: session?.user.id,
  });

  // Protect admin routes except the admin login page
  if (isAdminRoute && !isAdminLogin) {
    if (!session) {
      console.log("[middleware] no session on admin route", { pathname });
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Require the user to exist in admin_users
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    console.log("[middleware] admin check", {
      pathname,
      userId: session.user.id,
      adminFound: !!adminData,
      adminError,
    });

    if (!adminData) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If already authenticated, keep them away from public login screens
  const isPublicLogin = pathname === "/login" || isAdminLogin;
  if (isPublicLogin && session) {
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (adminData) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
