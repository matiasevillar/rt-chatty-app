import jwt from 'jsonwebtoken'

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
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Set JWT token as HTTP-only cookie
  res.cookie('token-jwt', token, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}
