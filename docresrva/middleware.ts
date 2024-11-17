import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "./components/utils/constant";
import { toBeRedirectedRoutes } from "./components/utils/routes";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;



  
  

  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }


  
  const tokenVerified = await verifyToken("accessToken", req);
  console.log(tokenVerified)
  
  if (!tokenVerified) {
    
    if (pathname === "/login"||pathname === "/signup"||pathname === "/doctorSignup"||pathname === "/doctorLogin") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const toBeRedirected = toBeRedirectedRoutes(pathname);




  if (toBeRedirected && tokenVerified) {

    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }
  
  return NextResponse.next();
}

async function verifyToken(tokenName: string, req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(tokenName);

  
  if (!token?.value) {
    return false;
  }

  const secret = JWT_SECRET;
  if (!secret) {
    console.log("JWT secret not found in env");
    return false;
  }

  try {
  
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(secret)
    );

    
    return Boolean(payload);
  } catch (err: any) {
    console.log(`Failed to verify ${tokenName}`, err.message);
    return false;
  }
}

