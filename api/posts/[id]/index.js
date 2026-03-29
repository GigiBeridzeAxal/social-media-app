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
      const post = await Post.findById(id)
        .populate('author', 'name email avatar')
        .lean()

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const commentsCount = await Comment.countDocuments({ post: post._id })

      return res.status(200).json({
        post: {
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
          commentsCount,
          liked: post.likes.some(uid => uid.toString() === decoded.userId),
          bookmarked: post.bookmarks.some(uid => uid.toString() === decoded.userId),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        },
      })
    } catch (error) {
      console.error('Get post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const post = await Post.findById(id)
      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      if (post.author.toString() !== decoded.userId) {
        return res.status(403).json({ error: 'You can only edit your own posts' })
      }

      const { content, image } = req.body || {}

      if (content !== undefined) {
        if (!content.trim()) {
          return res.status(400).json({ error: 'Content is required' })
        }
        if (content.length > 500) {
          return res.status(400).json({ error: 'Content must be at most 500 characters' })
        }
        post.content = content.trim()
      }

      if (image !== undefined) {
        post.image = image || null
      }

      await post.save()

      const populated = await Post.findById(id)
        .populate('author', 'name email avatar')
        .lean()

      const commentsCount = await Comment.countDocuments({ post: id })

      return res.status(200).json({
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
          likesCount: populated.likes.length,
          commentsCount,
          liked: populated.likes.some(uid => uid.toString() === decoded.userId),
          bookmarked: populated.bookmarks.some(uid => uid.toString() === decoded.userId),
          createdAt: populated.createdAt.toISOString(),
          updatedAt: populated.updatedAt.toISOString(),
        },
      })
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message)
        return res.status(400).json({ error: messages[0] })
      }
      console.error('Update post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
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
    } catch (error) {
      console.error('Delete post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
