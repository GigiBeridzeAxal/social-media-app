import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'social-media-app-secret-key-change-in-production'

/**
 * Auth middleware for Vercel serverless functions.
 * Extracts JWT from Authorization header (Bearer token) or httpOnly cookie.
 * Returns decoded payload { userId, email } on success, or sends 401 and returns null.
 */
export default function authMiddleware(req, res) {
  let token = null

  // 1. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  // 2. Fallback to httpOnly cookie
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, ...rest] = cookie.trim().split('=')
      acc[key] = rest.join('=')
      return acc
    }, {})
    token = cookies.token || null
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' })
    } else {
      res.status(401).json({ error: 'Invalid token' })
    }
    return null
  }
}
