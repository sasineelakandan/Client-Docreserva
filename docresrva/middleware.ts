import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";


const ADMIN_ROUTES = new Set(["/admin", "/patients","/doctors","/verifiedDoctors",'/appointmetManagement']);
const DOCTOR_ROUTES = new Set(["/doctorHome", "/doctorProfile",'/appointmentPage']);
const USER_ROUTES = new Set(["/userHome", "/userProfile","/alldoctors","/doctorDetails",'/patientDetails','/confirmBooking','/paymentSuccessPage','/paymentFailurePage','/appointmentPageuser']);
const PUBLIC_ROUTES = new Set([
  "/login", 
  "/signup", 
  "/doctorSignup", 
  "/doctorLogin", 
  "/userOtp", 
  "/doctorOtp", 
  "/adminLogin"
]);
const UNPROTECTED_ROUTES = new Set(["/_next/", "/favicon.ico", "/api/"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow unprotected or public routes without requiring authentication
  if ([...UNPROTECTED_ROUTES].some(route => pathname.startsWith(route)) || pathname === "/") {
    console.log(`Allowing access to public route: ${pathname}`);
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.has(pathname)) {
    console.log(`Allowing access to public page: ${pathname}`);
    return NextResponse.next();
  }

  // Verify token to get role
  const tokenData = await verifyToken("accessToken", req);
  const role = tokenData?.role;

  if (!role) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /login`);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access control
  if (role === "admin" && !ADMIN_ROUTES.has(pathname)) {
    console.log(`Unauthorized access attempt by admin to ${pathname}. Redirecting to /admin`);
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (role === "doctor" && !DOCTOR_ROUTES.has(pathname)) {
    console.log(`Unauthorized access attempt by doctor to ${pathname}. Redirecting to /doctorHome`);
    return NextResponse.redirect(new URL("/doctorHome", req.url));
  }

  if (role === "user" && !USER_ROUTES.has(pathname)) {
    console.log(`Unauthorized access attempt by user to ${pathname}. Redirecting to /userHome`);
    return NextResponse.redirect(new URL("/userHome", req.url));
  }

  console.log(`Allowing access to ${pathname} for role: ${role}`);
  return NextResponse.next();
}


async function verifyToken(tokenName: string, req: NextRequest): Promise<{ role: string | null }> {
  const token = req.cookies.get(tokenName);

  if (!token?.value) {
    console.error("Token not found in cookies");
    return { role: null };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables");
    return { role: null };
  }

  try {
    const { payload } = await jwtVerify(token.value, new TextEncoder().encode(secret));
    const role = payload?.role as string | undefined;

    if (!role) {
      console.error("Role not found in token payload");
      return { role: null };
    }

    console.log(`Verified role: ${role}`);
    return { role };
  } catch (err: any) {
    console.error(`Failed to verify token: ${err.message}`);
    return { role: null };
  }
}
