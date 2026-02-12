import {
  clerkMiddleware,
  clerkClient,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/api/webhook/register",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  //Clerk v5: auth() must be CALLED
  const { userId } = await auth();

  // Not logged in, then protected route
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (userId) {
    try {
      // Clerk v5: clerkClient() must be CALLED
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      const role = user.publicMetadata?.role as string | undefined;

      //Non-admin accessing admin routes
      if (role !== "admin" && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      //Admin visiting user dashboard
      if (role === "admin" && pathname === "/dashboard") {
        return NextResponse.redirect(
          new URL("/admin/dashboard", request.url)
        );
      }

      //Logged-in user visiting public routes
      if (isPublicRoute(request)) {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "/dashboard",
            request.url
          )
        );
      }
    } catch (error) {
      console.error("Clerk middleware error:", error);
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }
});
