
const changeToHomeRoutes = new Set(["/login", 'signup,/userOtp','doctorLogin','doctorSignup,doctorOtp']);



export function toBeRedirectedRoutes(pathname: string): boolean {
  return changeToHomeRoutes.has(pathname) 
}



