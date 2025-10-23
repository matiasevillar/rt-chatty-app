import jwt from 'jsonwebtoken'
import User from '../models/User.js'
/**
 * Middleware to authenticate JWT token from cookies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */

export const authenticate = async (req, res, next) => {
  try {
    // First get token from cookie
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    // We then verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // decoded contains {userId, email}

    // Get user from database (without password)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}
