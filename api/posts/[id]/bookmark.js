import connectDB from '../../_lib/db.js'
import Post from '../../_lib/models/Post.js'
import authMiddleware from '../../_lib/authMiddleware.js'
import { handleOptions } from '../../_lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  const { id } = req.query

  try {
    await connectDB()

    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const alreadyBookmarked = post.bookmarks.some(uid => uid.toString() === decoded.userId)

    if (alreadyBookmarked) {
      post.bookmarks = post.bookmarks.filter(uid => uid.toString() !== decoded.userId)
    } else {
      post.bookmarks.push(decoded.userId)
    }

    await post.save()

    return res.status(200).json({
      bookmarked: !alreadyBookmarked,
    })
  } catch (error) {
    console.error('Toggle bookmark error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
