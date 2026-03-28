import connectDB from '../../_lib/db.js'
import Post from '../../_lib/models/Post.js'
import Comment from '../../_lib/models/Comment.js'
import authMiddleware from '../../_lib/authMiddleware.js'
import { handleOptions } from '../../_lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  const { id } = req.query

  await connectDB()

  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1)
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
      const skip = (page - 1) * limit

      const postExists = await Post.exists({ _id: id })
      if (!postExists) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const comments = await Comment.find({ post: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean()

      const result = comments.map(comment => ({
        id: comment._id.toString(),
        postId: comment.post.toString(),
        author: {
          id: comment.author._id.toString(),
          name: comment.author.name,
          email: comment.author.email,
          avatar: comment.author.avatar,
        },
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      }))

      const total = await Comment.countDocuments({ post: id })

      return res.status(200).json({ comments: result, page, limit, total })
    } catch (error) {
      console.error('List comments error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { content } = req.body || {}

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' })
      }

      if (content.length > 300) {
        return res.status(400).json({ error: 'Comment must be at most 300 characters' })
      }

      const postExists = await Post.exists({ _id: id })
      if (!postExists) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const comment = await Comment.create({
        post: id,
        author: decoded.userId,
        content: content.trim(),
      })

      const populated = await Comment.findById(comment._id)
        .populate('author', 'name email avatar')
        .lean()

      return res.status(201).json({
        comment: {
          id: populated._id.toString(),
          postId: populated.post.toString(),
          author: {
            id: populated.author._id.toString(),
            name: populated.author.name,
            email: populated.author.email,
            avatar: populated.author.avatar,
          },
          content: populated.content,
          createdAt: populated.createdAt.toISOString(),
          updatedAt: populated.updatedAt.toISOString(),
        },
      })
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message)
        return res.status(400).json({ error: messages[0] })
      }
      console.error('Create comment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
