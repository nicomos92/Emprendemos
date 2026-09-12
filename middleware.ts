import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/products",
  "/customers",
  "/quotes",
  "/orders",
  "/payments",
  "/cash",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isPublicRoute(pathname: string) {
  return pathname === "/" || pathname === "/auth/callback" || pathname.startsWith("/catalogo/");
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Public routes never need a session check or redirect decision, but we
  // still let getUser() run below so cookies stay refreshed for them too —
  // except /auth/callback, which manages its own redirect after the code
  // exchange and must not be intercepted here.
  if (pathname === "/auth/callback") {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run any logic between createServerClient and
  // getUser(). A simple mistake could make it very hard to debug issues
  // with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  const isProtectedRoute = matchesPrefix(pathname, PROTECTED_PREFIXES);
  const isAuthRoute = matchesPrefix(pathname, AUTH_ROUTES);

  if (!user) {
    if (isProtectedRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  if (isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasBusiness = !!profile?.business_id;

  if (pathname === "/onboarding") {
    if (hasBusiness) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
    return supabaseResponse;
  }

  if (!hasBusiness) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    onboardingUrl.search = "";
    return NextResponse.redirect(onboardingUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
