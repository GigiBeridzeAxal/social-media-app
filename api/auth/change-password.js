import bcrypt from 'bcryptjs'
import connectDB from '../lib/db.js'
import User from '../lib/models/User.js'
import authMiddleware from '../lib/authMiddleware.js'
import { handleOptions } from '../lib/cors.js'

const BCRYPT_SALT_ROUNDS = 12

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

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
