import connectDB from '../../lib/db.js'
import User from '../../lib/models/User.js'
import authMiddleware from '../../lib/authMiddleware.js'
import { handleOptions } from '../../lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = authMiddleware(req, res)
  if (!decoded) return

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

    const alreadyFollowing = targetUser.followers.some(uid => uid.toString() === decoded.userId)

    if (alreadyFollowing) {
      targetUser.followers = targetUser.followers.filter(uid => uid.toString() !== decoded.userId)
      currentUser.following = currentUser.following.filter(uid => uid.toString() !== id)
    } else {
      targetUser.followers.push(decoded.userId)
      currentUser.following.push(id)
    }

    await targetUser.save()
    await currentUser.save()

    return res.status(200).json({
      following: !alreadyFollowing,
      followersCount: targetUser.followers.length,
    })
  } catch (error) {
    console.error('Toggle follow error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
