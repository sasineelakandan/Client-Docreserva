import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the access token cookie
  res.setHeader('Set-Cookie', 'accessToken=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict; Domain=.docreserva.site');

  return res.status(200).json({ message: 'Logout successful' });
}
