import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import jwt,{JwtPayload} from 'jsonwebtoken';
import { log } from "console";

const ADMIN_ROUTES = new Set(["/admin/adminHome", "/admin/patients","/admin/doctors","/admin/verifiedDoctors",'/admin/appointmetManagement','/admin/reviews']);
const DOCTOR_ROUTES = new Set(["/doctor/doctorHome", "/doctor/doctorProfile",'/doctor/appointmentPage','/doctor/chatroomDoctor','/doctor/wallet','/doctor/slotmanagement','/doctor/videoCall','/doctor/Notificationdoctor','/doctor/prescription','/doctor/prescriptionHistory']);
const USER_ROUTES = new Set([ '/user/userHome',"/user/userProfile","/user/alldoctors","/user/doctorDetails",'/user/patientDetails','/user/confirmBooking','/user/appointmentPageuser','/user/message','/user/Notification','/user/userWallet','/user/userVideocall']);
const PUBLIC_ROUTES = new Set([
  "/user/login", 
  "/user/signup", 
  "/doctor/doctorSignup", 
  "/doctor/doctorLogin", 
  "/user/userOtp", 
  "/doctor/doctorOtp", 
  "/admin/adminLogin",
  '/doctor/ForgotPassword',
  '/doctor/forgotOtp',
  '/map',
  
  '/user/paymentSuccessPage',
  '/user/paymentFailurePage'
]);
const UNPROTECTED_ROUTES = new Set(["/_next/", "/favicon.ico", "/api/"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(req)

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
  const tokenData = await verifyToken("refreshToken", req);
  const role = tokenData?.role;

  if (!role) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /login`);
    return NextResponse.redirect(new URL("/user/login", req.url));
  }

  // Role-based access control
  if (role === "admin" && !ADMIN_ROUTES.has(pathname)) {
    console.log(`Unauthorized access attempt by admin to ${pathname}. Redirecting to /admin`);
    return NextResponse.redirect(new URL("/admin/adminHome", req.url));
  }

  if (role === "doctor" && !DOCTOR_ROUTES.has(pathname)) {
    console.log(`Unauthorized access attempt by doctor to ${pathname}. Redirecting to /doctorHome`);
    return NextResponse.redirect(new URL("/doctor/doctorHome", req.url));
  }

  if (role === "user" && !USER_ROUTES.has(pathname)) {
    console.log(`Unauthorized access attempt by user to ${pathname}. Redirecting to /userHome`);
    return NextResponse.redirect(new URL("/user/userHome", req.url));
  }

  console.log(`Allowing access to ${pathname} for role: ${role}`);
  return NextResponse.next();
}



async function verifyToken(tokenName: string, req: NextRequest): Promise<{ role: string | null }> {
  
  const token = req.cookies.get(tokenName);  // Get token from cookies
  console.log(req.cookies);
  console.log(token?.value, '------------------------------------------');
  
  if (!token?.value) {
    console.error("Token not found in cookies");
    return { role: null };
  }

  const secret = process.env.JWT_SECRET;  // Retrieve the secret from environment variables
  console.log('secret', secret);
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables");
    return { role: null };
  }

  try {
    // Verify the token using jose's jwtVerify function
    const { payload } = await jwtVerify(token.value, new TextEncoder().encode(secret));
    console.log('decoded payload', payload);

  
    const role = payload?.role as string | undefined;  // Type assertion to string

    if (!role) {
      console.error("Role not found in token payload");
      return { role: null };
    }

    console.log(`Verified role: ${role}`);
    return { role };  // Return the role
  } catch (err: any) {
    console.error(`Failed to verify token: ${err.message}`);
    return { role: null };  // Return null if token verification fails
  }
}
