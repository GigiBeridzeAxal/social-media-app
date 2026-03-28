import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '../_lib/db.js'
import User from '../_lib/models/User.js'
import authMiddleware from '../_lib/authMiddleware.js'
import { handleOptions } from '../_lib/cors.js'

const JWT_SECRET = process.env.JWT_SECRET || 'social-media-app-secret-key-change-in-production'
const BCRYPT_SALT_ROUNDS = 12
const TOKEN_EXPIRY = '7d'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60

function setTokenCookie(res, token) {
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
}

function clearTokenCookie(res) {
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
}

async function handleSignin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  try {
    await connectDB()

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
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

    setTokenCookie(res, token)

    return res.status(200).json({ user, token })
  } catch (error) {
    console.error('Signin error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleSignup(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  try {
    await connectDB()

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    })

    const user = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt.toISOString(),
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    )

    setTokenCookie(res, token)

    return res.status(201).json({ user, token })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ error: messages[0] })
    }

    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  clearTokenCookie(res)

  return res.status(200).json({ message: 'Logged out successfully' })
}

async function handleMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  try {
    await connectDB()

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Auth/me error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleRefresh(req, res) {
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

    setTokenCookie(res, token)

    return res.status(200).json({ user, token })
  } catch (error) {
    console.error('Token refresh error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleChangePassword(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  const { currentPassword, newPassword } = req.body || {}

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }

  try {
    await connectDB()

    const user = await User.findById(decoded.userId).select('+password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
    user.password = hashedPassword
    await user.save()

    return res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function handleForgotPassword(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  return res.status(200).json({
    message: 'If an account exists with this email, a password reset link has been sent.'
  })
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  const action = (req.query.action || []).join('/')

  switch (action) {
    case 'signin':          return handleSignin(req, res)
    case 'signup':          return handleSignup(req, res)
    case 'logout':          return handleLogout(req, res)
    case 'me':              return handleMe(req, res)
    case 'refresh':         return handleRefresh(req, res)
    case 'change-password': return handleChangePassword(req, res)
    case 'forgot-password': return handleForgotPassword(req, res)
    default:
      return res.status(404).json({ error: 'Not found' })
  }
}
