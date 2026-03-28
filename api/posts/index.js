import connectDB from '../lib/db.js'
import Post from '../lib/models/Post.js'
import Comment from '../lib/models/Comment.js'
import authMiddleware from '../lib/authMiddleware.js'
import { handleOptions } from '../lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  try {
    await connectDB()

    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
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
      const commentCountMap = {}
      commentCounts.forEach(c => { commentCountMap[c._id.toString()] = c.count })

      const enriched = posts.map(post => ({
        id: post._id.toString(),
        author: post.author,
        content: post.content,
        image: post.image,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: commentCountMap[post._id.toString()] || 0,
        liked: post.likes ? post.likes.some(id => id.toString() === decoded.userId) : false,
        bookmarked: post.bookmarks ? post.bookmarks.some(id => id.toString() === decoded.userId) : false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }))

      const total = await Post.countDocuments()

      return res.status(200).json({
        posts: enriched,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    }

    if (req.method === 'POST') {
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

      const populated = await Post.findById(post._id).populate('author', 'name email avatar')

      return res.status(201).json({
        id: populated._id.toString(),
        author: populated.author,
        content: populated.content,
        image: populated.image,
        likesCount: 0,
        commentsCount: 0,
        liked: false,
        bookmarked: false,
        createdAt: populated.createdAt,
        updatedAt: populated.updatedAt,
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Posts error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
