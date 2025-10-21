import { Router } from 'express'
import { login, logout, signup } from '../controllers/auth.controller.js'
import { validateSignup } from '../middleware/validation.js'
const router = Router()

router.post('/signup', validateSignup, signup)
router.get('/login', login)
router.get('/logout', logout)

export default router
