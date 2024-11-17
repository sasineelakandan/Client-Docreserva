


const changeToHomeRoutes = new Set([
  '/login',
  '/signup',
  
  '/doctorLogin',
  '/doctorSignup',
  
]);

export function toBeRedirectedRoutes(pathname: string): boolean {
  return changeToHomeRoutes.has(pathname);
}


