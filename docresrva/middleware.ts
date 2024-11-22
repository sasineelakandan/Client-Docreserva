import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "./components/utils/constant";
import { toBeRedirectedRoutes } from "./components/utils/routes";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/api/") ||
      pathname === "/"
  ) {
      console.log(`Allowing access to public route: ${pathname}`);
      return NextResponse.next();
  }

  
  if (pathname === "/userOtp" || pathname === "/doctorOtp") {
      console.log("Allowing access to OTP pages");
      return NextResponse.next();
  }

  
  let tokenVerified = false;
  try {
      tokenVerified = await verifyToken("accessToken", req);
  } catch (error) {
      console.error("Error during token verification:", error);
  }

  
  const unauthenticatedRoutes = new Set(["/login", "/signup", "/doctorSignup", "/doctorLogin"]);
  if (!tokenVerified && unauthenticatedRoutes.has(pathname)) {
      console.log(`Unauthenticated user accessing ${pathname}`);
      return NextResponse.next();
  }


  if (!tokenVerified) {
      console.log(`Redirecting unauthenticated user from ${pathname} to /login`);
      return NextResponse.redirect(new URL("/login", req.url));
  }

  
  if (toBeRedirectedRoutes(pathname)) {
      console.log(`Redirecting authenticated user from ${pathname} to /`);
      return NextResponse.redirect(new URL("/", req.url));
  }

  console.log(`Allowing access to ${pathname}`);
  return NextResponse.next();
}

async function verifyToken(tokenName: string, req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(tokenName);

  if (!token?.value) {
    return false;
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables");
    return false;
  }

  try {
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(secret)
    );
    return Boolean(payload);
  } catch (err: any) {
    console.error(`Failed to verify ${tokenName}: ${err.message}`);
    return false;
  }
}
