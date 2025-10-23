import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { clearTokenCookie, generateTokenAndSetCookie } from '../utils/jwtUtils.js'
import cloudinary from '../lib/cloudinary.js'
import { ENV } from '../lib/env.js'

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
      ...(ENV.NODE_ENV === 'development' && { error: error.message }),
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.sanitizedBody

    // Find user with password (since select: false in schema)
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // We need to check the password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(res, user)

    // Return successful response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user, // toJSON transform removes password automatically
        token,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(ENV.NODE_ENV === 'development' && { error: error.message }),
    })
  }
}

export const logout = (_, res) => {
  clearTokenCookie(res)

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  })
}

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, profileImg } = req.body
    const userId = req.user._id

    // Build update object with only provided field
    const updateData = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (profileImg !== undefined) {
      try {
        // Upload img to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profileImg, {
          folder: 'profile_images', // Optional: organize images in a folder
          transformation: [
            { width: 300, height: 300, crop: 'fill' }, // Resize to 300x300
            { quality: 'auto' }, // Auto quality optimization
          ],
        })

        // Save the Cloudinary URL to the updateData
        updateData.profileImg = uploadResponse.secure_url
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError)
        return res.status(400).json({
          success: false,
          message: 'Failed to upload profile image',
        })
      }
    }

    // We can now update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return updated document
      runValidators: true, // Run schema validators
    })

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {}
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message
      })

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(ENV.NODE_ENV === 'development' && { error: error.message }),
    })
  }
}
