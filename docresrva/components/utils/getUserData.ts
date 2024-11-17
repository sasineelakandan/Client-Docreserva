// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";
// import { unstable_noStore as noStore } from 'next/cache';
// import { JWT_SECRET } from "../utils/constant";


// interface JWTPayload {
//   id: string; 
//   username: string;
//   iat: number; 
//   exp: number;
// }

// export default async function getUserData(): Promise<JWTPayload> {
//   noStore();

//   const cookieStore = cookies();
//   const token = await cookieStore.get("accessToken");

  
//   if (!token?.value) {
//     throw new Error("Token not found");
//   }

//   const secret = JWT_SECRET;
//   if (!secret) {
//     throw new Error("JWT secret not found");
//   }

//   try {
    
//     const decoded = jwt.verify(token.value, secret) as JWTPayload;
//     return decoded;
//   } catch (err: any) {
    
//     throw new Error(err.message || "Token verification failed");
//   }
// }
