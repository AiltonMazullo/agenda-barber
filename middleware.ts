// import { NextResponse, type NextRequest } from "next/server";

// const SESSION_COOKIE = "sm_token";

// const PROTECTED_PREFIXES = [
//   "/dashboard",
//   "/schedule",
//   "/clients",
//   "/orders",
//   "/cashier",
//   "/subscriptions",
//   "/commissions",
//   "/inventory",
//   "/financial",
//   "/reports",
//   "/settings",
//   "/access-control",
//   "/billing",
// ];

// const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const token = request.cookies.get(SESSION_COOKIE)?.value;
//   const isAuthenticated = Boolean(token);

//   const isProtected = PROTECTED_PREFIXES.some((prefix) =>
//     pathname.startsWith(prefix),
//   );
//   const isAuthRoute = AUTH_ROUTES.includes(pathname);

//   if (isProtected && !isAuthenticated) {
//     const loginUrl = request.nextUrl.clone();
//     loginUrl.pathname = "/login";
//     if (pathname !== "/dashboard") {
//       loginUrl.searchParams.set("from", pathname);
//     }
//     return NextResponse.redirect(loginUrl);
//   }

//   if (isAuthRoute && isAuthenticated) {
//     const dashboardUrl = request.nextUrl.clone();
//     dashboardUrl.pathname = "/dashboard";
//     return NextResponse.redirect(dashboardUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
// };
