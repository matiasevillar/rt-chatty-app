import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/jwtUtils.js'

export const signup = async (req, res) => {
  try {
    // req.sanitizedBody is now available thanks to the middleware
    const { firstName, lastName, email, password } = req.sanitizedBody

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      })
    }

    // Hash Password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Then we can create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    })

    await newUser.save() // ✅ User NOW saved to MongoDB

    const token = generateTokenAndSetCookie(res, newUser)

    // Return successful
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser,
        token,
      },
    })

    // TODO: Send welcome email to user
  } catch (error) {
    console.error('Signup error:', error)

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    })
  }
}

export const login = (req, res) => {
  res.send('Login')
}

export const logout = (req, res) => {
  res.send('Logout')
}
