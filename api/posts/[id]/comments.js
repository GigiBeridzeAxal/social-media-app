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

    // Verify post exists
    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      const comments = await Comment.find({ post: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean()

      const total = await Comment.countDocuments({ post: id })

      const formatted = comments.map(c => ({
        id: c._id.toString(),
        post: c.post.toString(),
        author: c.author,
        content: c.content,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))

      return res.status(200).json({
        comments: formatted,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    }

    if (req.method === 'POST') {
      const { content } = req.body || {}

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' })
      }

      if (content.length > 300) {
        return res.status(400).json({ error: 'Comment must be at most 300 characters' })
      }

      const comment = await Comment.create({
        post: id,
        author: decoded.userId,
        content: content.trim(),
      })

      const populated = await Comment.findById(comment._id).populate('author', 'name email avatar')

      return res.status(201).json({
        id: populated._id.toString(),
        post: populated.post.toString(),
        author: populated.author,
        content: populated.content,
        createdAt: populated.createdAt,
        updatedAt: populated.updatedAt,
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Comments error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
