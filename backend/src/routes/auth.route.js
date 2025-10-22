import { Router } from 'express'
import { login, logout, signup, updateProfile } from '../controllers/auth.controller.js'
import { validateLogin, validateSignup } from '../middlewares/validation.middleware.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/signup', validateSignup, signup)
router.post('/login', validateLogin, login)
router.post('/logout', logout)

router.put('/update-profile', authenticate, updateProfile)

router.get('/check', authenticate, (req, res) => res.status(200).json(req.user))

export default router
