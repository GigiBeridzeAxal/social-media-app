import connectDB from '../lib/db.js'
import User from '../lib/models/User.js'
import authMiddleware from '../lib/authMiddleware.js'
import { handleOptions } from '../lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate token via auth middleware
  const decoded = authMiddleware(req, res)
  if (!decoded) return // middleware already sent 401

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
