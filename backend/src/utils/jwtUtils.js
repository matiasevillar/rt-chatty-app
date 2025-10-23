import jwt from 'jsonwebtoken'
import { ENV } from '../lib/env.js'
/**
 * Generates JWT token and sets it as HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {Object} user - User object containing _id and email
 * @returns {string} - The generated JWT token
 */
export const generateTokenAndSetCookie = (res, user) => {
  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Set JWT token as HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true, // Prevents XSS attacks
    secure: ENV.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  })

  return token
}

/**
 * Clears the authentication token cookie
 * @param {Object} res - Express response object
 */
export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}
