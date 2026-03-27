import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'social-media-app-secret-key-change-in-production'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  const user = {
    id: Buffer.from(email).toString('base64url').slice(0, 16),
    email,
    name,
    avatar: null,
    createdAt: new Date().toISOString()
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d'
  })

  return res.status(201).json({ user, token })
}
