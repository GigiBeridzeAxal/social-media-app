import connectDB from '../lib/db.js'
import Post from '../lib/models/Post.js'
import Comment from '../lib/models/Comment.js'
import authMiddleware from '../lib/authMiddleware.js'
import { handleOptions } from '../lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  await connectDB()

  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1)
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
      const skip = (page - 1) * limit

      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean()

      const postIds = posts.map(p => p._id)
      const commentCounts = await Comment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: '$post', count: { $sum: 1 } } },
      ])
      const countMap = {}
      commentCounts.forEach(c => { countMap[c._id.toString()] = c.count })

      const result = posts.map(post => ({
        id: post._id.toString(),
        author: {
          id: post.author._id.toString(),
          name: post.author.name,
          email: post.author.email,
          avatar: post.author.avatar,
        },
        content: post.content,
        image: post.image,
        likesCount: post.likes.length,
        commentsCount: countMap[post._id.toString()] || 0,
        liked: post.likes.some(id => id.toString() === decoded.userId),
        bookmarked: post.bookmarks.some(id => id.toString() === decoded.userId),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }))

      const total = await Post.countDocuments()

      return res.status(200).json({ posts: result, page, limit, total })
    } catch (error) {
      console.error('List posts error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { content, image } = req.body || {}

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' })
      }

      if (content.length > 500) {
        return res.status(400).json({ error: 'Content must be at most 500 characters' })
      }

      const post = await Post.create({
        author: decoded.userId,
        content: content.trim(),
        image: image || null,
      })

      const populated = await Post.findById(post._id)
        .populate('author', 'name email avatar')
        .lean()

      return res.status(201).json({
        post: {
          id: populated._id.toString(),
          author: {
            id: populated.author._id.toString(),
            name: populated.author.name,
            email: populated.author.email,
            avatar: populated.author.avatar,
          },
          content: populated.content,
          image: populated.image,
          likesCount: 0,
          commentsCount: 0,
          liked: false,
          bookmarked: false,
          createdAt: populated.createdAt.toISOString(),
          updatedAt: populated.updatedAt.toISOString(),
        },
      })
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message)
        return res.status(400).json({ error: messages[0] })
      }
      console.error('Create post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
