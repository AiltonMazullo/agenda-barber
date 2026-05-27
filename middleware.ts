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

interface ClientPathInfo {
  slug: string;
  /** Sub-rota após o slug (sem barra inicial) ou "" para a vitrine. */
  sub: string;
}

function parseClientPath(pathname: string): ClientPathInfo | null {
  if (!pathname.startsWith("/client/")) return null;
  const parts = pathname.split("/").filter(Boolean); // ["client", slug, ...rest]
  const slug = parts[1];
  if (!slug) return null;
  const sub = parts.slice(2).join("/");
  return { slug, sub };
}

const CLIENT_PROTECTED_SUBS = ["agendar", "me"];
const CLIENT_PUBLIC_AUTH_SUBS = ["login", "register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ownerToken = req.cookies.get("sm_token")?.value;
  const clientToken = req.cookies.get("sm_client_token")?.value;

  // ─── Rotas do cliente final (/client/[slug]/...) ──────────────────────────
  const clientInfo = parseClientPath(pathname);
  if (clientInfo) {
    const { slug, sub } = clientInfo;
    const firstSeg = sub.split("/")[0] ?? "";

    if (CLIENT_PROTECTED_SUBS.includes(firstSeg) && !clientToken) {
      const url = req.nextUrl.clone();
      url.pathname = `/client/${slug}/login`;
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    if (CLIENT_PUBLIC_AUTH_SUBS.includes(firstSeg) && clientToken) {
      const url = req.nextUrl.clone();
      url.pathname = `/client/${slug}/agendar`;
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ─── Rotas do dono ────────────────────────────────────────────────────────
  if (isProtected(pathname) && !ownerToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicAuth(pathname) && ownerToken) {
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
