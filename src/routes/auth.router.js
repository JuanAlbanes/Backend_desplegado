import express from 'express'
import AuthController from '../controllers/auth.controller.js'

const auth_router = express.Router()

auth_router.post('/register', AuthController.register)
auth_router.post('/login', AuthController.login)
auth_router.get('/verify-email/:verification_token', AuthController.verifyEmail)
auth_router.put('/reset-password', AuthController.resetPassword)

export default auth_router