
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // You can add custom logic here if needed, for example, role-based access control
    // For now, if the user is authenticated, they can access the requested page.
    // If not, they will be redirected to the signIn page by `withAuth`.
    
    // Example: Redirect admin to a specific admin dashboard
    // if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
    //   return NextResponse.rewrite(new URL("/denied", req.url));
    // }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // If there is a token, the user is authorized
    },
    pages: {
      signIn: "/login", // Redirect to /login if not authorized
    },
  }
);

// Specifies the paths that the middleware should apply to.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login page itself to avoid redirect loops
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
