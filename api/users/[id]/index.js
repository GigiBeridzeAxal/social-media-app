import connectDB from '../../lib/db.js'
import User from '../../lib/models/User.js'
import authMiddleware from '../../lib/authMiddleware.js'
import { handleOptions } from '../../lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  const { id } = req.query

  try {
    await connectDB()

    if (req.method === 'GET') {
      const user = await User.findById(id).lean()
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || '',
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        isFollowing: user.followers ? user.followers.some(fid => fid.toString() === decoded.userId) : false,
        createdAt: user.createdAt,
      })
    }

    if (req.method === 'PUT') {
      if (id !== decoded.userId) {
        return res.status(403).json({ error: 'You can only update your own profile' })
      }

      const { name, bio, avatar } = req.body || {}
      const updates = {}

      if (name !== undefined) {
        if (name.trim().length < 2) {
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

      const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).lean()
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio || '',
        followersCount: updatedUser.followers ? updatedUser.followers.length : 0,
        followingCount: updatedUser.following ? updatedUser.following.length : 0,
        createdAt: updatedUser.createdAt,
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('User profile error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
