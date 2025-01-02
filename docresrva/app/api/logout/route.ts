

import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Clear the cookie by setting the expiration date in the past
    const cookies = cookie.parse(req.headers.cookie || '');

    // Access the 'accessToken' cookie
    const accessToken = cookies.accessToken;

    console.log('Access Token:', accessToken); // Logs the value of the accessToken cookie

    res.setHeader('Set-Cookie', 'accessToken=; Path=/; HttpOnly; Secure; Max-Age=0; SameSite=None');

    // Respond with success message
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Error during logout' });
  }
}
