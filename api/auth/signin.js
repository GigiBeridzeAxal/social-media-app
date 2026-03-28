import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '../lib/db.js'
import User from '../lib/models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'social-media-app-secret-key-change-in-production'
const TOKEN_EXPIRY = '7d'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

function setCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

export default async function handler(req, res) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  try {
    await connectDB()

    // Find user by email, explicitly include password field (select: false in schema)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, existingUser.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Build user response object (exclude password)
    const user = {
      id: existingUser._id.toString(),
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar,
      createdAt: existingUser.createdAt.toISOString(),
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    )

    // Set token as httpOnly cookie
    const cookieOptions = [
      `token=${token}`,
      `HttpOnly`,
      `Path=/`,
      `Max-Age=${COOKIE_MAX_AGE}`,
      `SameSite=Lax`,
    ]

    // Use Secure flag in production (HTTPS)
    if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure')
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '))

    return res.status(200).json({ user, token })
  } catch (error) {
    console.error('Signin error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
