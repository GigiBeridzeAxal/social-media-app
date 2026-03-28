import connectDB from '../../lib/db.js'
import Post from '../../lib/models/Post.js'
import Comment from '../../lib/models/Comment.js'
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
      const post = await Post.findById(id).populate('author', 'name email avatar').lean()
      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const commentsCount = await Comment.countDocuments({ post: id })

      return res.status(200).json({
        id: post._id.toString(),
        author: post.author,
        content: post.content,
        image: post.image,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount,
        liked: post.likes ? post.likes.some(lid => lid.toString() === decoded.userId) : false,
        bookmarked: post.bookmarks ? post.bookmarks.some(bid => bid.toString() === decoded.userId) : false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })
    }

    if (req.method === 'DELETE') {
      const post = await Post.findById(id)
      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      if (post.author.toString() !== decoded.userId) {
        return res.status(403).json({ error: 'You can only delete your own posts' })
      }

      await Post.findByIdAndDelete(id)
      await Comment.deleteMany({ post: id })

      return res.status(200).json({ message: 'Post deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Post [id] error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
