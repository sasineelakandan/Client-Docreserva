import { NextApiRequest, NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  console.log('hai')
  // Parse cookies from the request
  const cookies = parse(req.headers.cookie || '');

  // Clear all cookies by setting them with an expired date
  const clearCookies = Object.keys(cookies).map((cookieName) =>
    serialize(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    })
  );

  // Set the cleared cookies in the response header
  res.setHeader('Set-Cookie', clearCookies);

  return res.status(200).json({ message: 'All cookies cleared successfully' });
}
