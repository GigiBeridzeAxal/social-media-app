import jwt from 'jsonwebtoken'
import connectDB from '../lib/db.js'
import User from '../lib/models/User.js'
import authMiddleware from '../lib/authMiddleware.js'
import { handleOptions } from '../lib/cors.js'

const JWT_SECRET = process.env.JWT_SECRET || 'social-media-app-secret-key-change-in-production'
const TOKEN_EXPIRY = '7d'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  try {
    await connectDB()

    const existingUser = await User.findById(decoded.userId)
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = {
      id: existingUser._id.toString(),
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar,
      createdAt: existingUser.createdAt.toISOString(),
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    )

    const cookieOptions = [
      `token=${token}`,
      `HttpOnly`,
      `Path=/`,
      `Max-Age=${COOKIE_MAX_AGE}`,
      `SameSite=Lax`,
    ]

    if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure')
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '))

    return res.status(200).json({ user, token })
  } catch (error) {
    console.error('Token refresh error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
