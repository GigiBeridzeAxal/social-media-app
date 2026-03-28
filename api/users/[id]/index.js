import connectDB from '../../lib/db.js'
import User from '../../lib/models/User.js'
import authMiddleware from '../../lib/authMiddleware.js'
import { handleOptions } from '../../lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  const { id } = req.query

  await connectDB()

  if (req.method === 'GET') {
    try {
      const user = await User.findById(id).lean()
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio || '',
          followersCount: (user.followers || []).length,
          followingCount: (user.following || []).length,
          isFollowing: (user.followers || []).some(uid => uid.toString() === decoded.userId),
          createdAt: user.createdAt.toISOString(),
        },
      })
    } catch (error) {
      console.error('Get user profile error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      if (id !== decoded.userId) {
        return res.status(403).json({ error: 'You can only update your own profile' })
      }

      const { name, bio, avatar } = req.body || {}
      const updates = {}

      if (name !== undefined) {
        if (!name.trim() || name.trim().length < 2) {
          return res.status(400).json({ error: 'Name must be at least 2 characters' })
        }
        updates.name = name.trim()
      }

      if (bio !== undefined) {
        if (bio.length > 160) {
          return res.status(400).json({ error: 'Bio must be at most 160 characters' })
        }
        updates.bio = bio
      }

      if (avatar !== undefined) {
        updates.avatar = avatar
      }

      const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean()
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio || '',
          followersCount: (user.followers || []).length,
          followingCount: (user.following || []).length,
          createdAt: user.createdAt.toISOString(),
        },
      })
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message)
        return res.status(400).json({ error: messages[0] })
      }
      console.error('Update user profile error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
