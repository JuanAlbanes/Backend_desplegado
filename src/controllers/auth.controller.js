import AuthService from "../services/auth.service.js"
import { ServerError } from "../utils/customError.utils.js"
import ENVIRONMENT from "../config/environment.config.js"

class AuthController {
    static async register(request, response) {
        try {
            const {
                username, 
                email, 
                password
            } = request.body
            console.log('Register request body:', request.body)

            if(!username){
                throw new ServerError(
                    400, 
                    'Debes enviar un nombre de usuario valido'
                )
            }
            else if(!email || !String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
                throw new ServerError(
                    400, 
                    'Debes enviar un email valido'
                )
            }
            else if(!password || password.length < 8){
                throw new ServerError(
                    400, 
                    'Debes enviar una contraseña valida'
                )
            }
            await AuthService.register(username, password, email)

            response.json({
                ok: true,
                status: 200,
                message: 'Usuario registrado con exito! Verifica el email y ya puedes loguearte'
            })
        }
        catch (error) {
            console.log('Error en AuthController.register:', error)
            if (error.status) {
                return response.status(error.status).json(
                    {
                        ok: false,
                        status: error.status,
                        message: error.message
                    }
                )
            }
            else {
                return response.status(500).json(
                    {
                        ok: false,
                        status: 500,
                        message: 'Error interno del servidor'
                    }
                )
            }
        }
    }

    static async login(request, response) {
        try{
            const {email, password} = request.body
            
            // ✅ CORREGIDO: Validar campos requeridos
            if (!email || !password) {
                throw new ServerError(400, 'Email y contraseña son requeridos')
            }
            
            const { authorization_token } = await AuthService.login(email, password)
            
            // ✅ CORREGIDO: Verificar que el token se generó correctamente
            if (!authorization_token) {
                throw new ServerError(500, 'Error al generar el token de autorización')
            }
            
            return response.json({
                ok: true,
                message: 'Logueado con exito',
                status: 200,
                data: {
                    authorization_token: authorization_token
                }
            })
        }
        catch (error) {
            console.log('Error en AuthController.login:', error)
            if (error.status) {
                return response.status(error.status).json(
                    {
                        ok: false,
                        status: error.status,
                        message: error.message
                    }
                )
            }
            else {
                return response.status(500).json(
                    {
                        ok: false,
                        status: 500,
                        message: 'Error interno del servidor'
                    }
                )
            }
        }
    }

    static async verifyEmail(request, response) {
        try{
            const {verification_token} = request.params
            await AuthService.verifyEmail(verification_token)
            return response.redirect(ENVIRONMENT.URL_FRONTEND + '/login')
        } 
        catch (error) {
            console.log('Error en AuthController.verifyEmail:', error)
            if (error.status) {
                return response.status(error.status).json(
                    {
                        ok: false,
                        status: error.status,
                        message: error.message
                    }
                )
            }
            else {
                return response.status(500).json(
                    {
                        ok: false,
                        status: 500,
                        message: 'Error interno del servidor'
                    }
                )
            }
        }
    }

    static async resetPassword(request, response) {
        try{
            const { email, newPassword } = request.body

            // Validaciones
            if(!email || !String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
                throw new ServerError(400, 'Debes enviar un email válido')
            }
            else if(!newPassword || newPassword.length < 8){
                throw new ServerError(400, 'La nueva contraseña debe tener al menos 8 caracteres')
            }

            const result = await AuthService.resetPassword(email, newPassword)

            return response.json({
                ok: true,
                status: 200,
                message: result.message
            })
        }
        catch (error) {
            console.log('Error en AuthController.resetPassword:', error)
            if (error.status) {
                return response.status(error.status).json(
                    {
                        ok: false,
                        status: error.status,
                        message: error.message
                    }
                )
            }
            else {
                return response.status(500).json(
                    {
                        ok: false,
                        status: 500,
                        message: 'Error interno del servidor'
                    }
                )
            }
        }
    }
}

export default AuthController