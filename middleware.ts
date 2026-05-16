import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/schedule",
  "/clients",
  "/subscriptions",
  "/cashier",
  "/financial",
  "/inventory",
  "/reports",
  "/settings",
  "/access-control",
  "/billing",
  "/orders",
  "/commissions",
];

const PUBLIC_AUTH_PATHS = ["/login", "/register", "/forgot-password"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isPublicAuth(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sm_token")?.value;

  // Sem token → bloqueia rota protegida
  if (isProtected(pathname) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Já autenticado → tira do /login ou /register
  if (isPublicAuth(pathname) && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif)$).*)",
  ],
};
