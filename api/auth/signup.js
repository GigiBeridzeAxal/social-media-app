import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '../lib/db.js'
import User from '../lib/models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'social-media-app-secret-key-change-in-production'
const BCRYPT_SALT_ROUNDS = 12
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

  const { name, email, password } = req.body || {}

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }

  // Validate name length
  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  try {
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    // Create user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    })

    // Build user response object (exclude password)
    const user = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt.toISOString(),
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

    return res.status(201).json({ user, token })
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ error: messages[0] })
    }

    // Handle duplicate key error (race condition on unique email)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
