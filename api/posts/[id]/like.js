import connectDB from '../../lib/db.js'
import Post from '../../lib/models/Post.js'
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

  try {
    await connectDB()

    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const alreadyLiked = post.likes.some(uid => uid.toString() === decoded.userId)

    if (alreadyLiked) {
      post.likes = post.likes.filter(uid => uid.toString() !== decoded.userId)
    } else {
      post.likes.push(decoded.userId)
    }

    await post.save()

    return res.status(200).json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    })
  } catch (error) {
    console.error('Like error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
