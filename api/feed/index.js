import connectDB from '../_lib/db.js'
import Post from '../_lib/models/Post.js'
import Comment from '../_lib/models/Comment.js'
import User from '../_lib/models/User.js'
import authMiddleware from '../_lib/authMiddleware.js'
import { handleOptions } from '../_lib/cors.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = authMiddleware(req, res)
  if (!decoded) return

  try {
    await connectDB()

    const currentUser = await User.findById(decoded.userId).lean()
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const followingIds = (currentUser.following || []).map(id => id.toString())
    const feedAuthors = [decoded.userId, ...followingIds]

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const posts = await Post.find({ author: { $in: feedAuthors } })
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
      liked: post.likes.some(uid => uid.toString() === decoded.userId),
      bookmarked: post.bookmarks.some(uid => uid.toString() === decoded.userId),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }))

    const total = await Post.countDocuments({ author: { $in: feedAuthors } })

    return res.status(200).json({ posts: result, page, limit, total })
  } catch (error) {
    console.error('Get feed error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
