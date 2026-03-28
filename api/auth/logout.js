import { handleOptions } from '../lib/cors.js'

export default function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Clear the token cookie
  const cookieOptions = [
    `token=`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=0`,
    `SameSite=Lax`,
  ]

  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure')
  }

  res.setHeader('Set-Cookie', cookieOptions.join('; '))

  return res.status(200).json({ message: 'Logged out successfully' })
}
