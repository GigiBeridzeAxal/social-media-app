import connectDB from '../../lib/db.js'
import User from '../../lib/models/User.js'
import authMiddleware from '../../lib/authMiddleware.js'
import { handleOptions } from '../../lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (id === decoded.userId) {
    return res.status(400).json({ error: 'You cannot follow yourself' })
  }

  try {
    await connectDB()

    const targetUser = await User.findById(id)
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentUser = await User.findById(decoded.userId)
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' })
    }

    const alreadyFollowing = currentUser.following.some(fid => fid.toString() === id)

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter(fid => fid.toString() !== id)
      targetUser.followers = targetUser.followers.filter(fid => fid.toString() !== decoded.userId)
    } else {
      currentUser.following.push(id)
      targetUser.followers.push(decoded.userId)
    }

    await currentUser.save()
    await targetUser.save()

    return res.status(200).json({
      following: !alreadyFollowing,
      followersCount: targetUser.followers.length,
    })
  } catch (error) {
    console.error('Follow error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
