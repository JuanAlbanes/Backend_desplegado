import UserRepository from "../repositories/user.repository.js"
import { ServerError } from "../utils/customError.utils.js"
import bcrypt from 'bcrypt'
import transporter from "../config/mailer.config.js"
import jwt from 'jsonwebtoken'
import ENVIRONMENT from "../config/environment.config.js"

class AuthService{
    static async register(username, password, email){
        console.log(username, password, email)
        
        const user_found = await UserRepository.getByEmail(email)
        if(user_found){
            throw new ServerError(400, 'Email ya en uso')
        } 

        const password_hashed = await bcrypt.hash(password,12) 

        const user_created = await UserRepository.createUser(username, email, password_hashed)

        const verification_token = jwt.sign(
            {
                email: email,
                user_id: user_created._id 
            },
            ENVIRONMENT.JWT_SECRET_KEY
        )

        await transporter.sendMail({
            from: ENVIRONMENT.GMAIL_USERNAME,
            to: email,
            subject: 'Verificacion de correo electronico',
            html: `
            <h1>Bienvenido a Slack Clon</h1>
            <p>Este es un mail de verificacion, dale click al link de abajo</p>
            <a href='${ENVIRONMENT.URL_API_BACKEND}/api/auth/verify-email/${verification_token}'>Verificar email</a>
            `
        })
    }

    static async verifyEmail(verification_token){
        try{
            const payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET_KEY)
            await UserRepository.updateById(
                payload.user_id, 
                {
                    verified_email: true
                }
            )
            return 
        }
        catch(error){
            if(error instanceof jwt.JsonWebTokenError){
                throw new  ServerError(400, 'Token invalido')
            }
            throw error
        }
    }

    static async login(email, password){
        const user = await UserRepository.getByEmail(email)
        if(!user){
            throw new ServerError(404, 'Email no registrado')
        }

        if(user.verified_email === false){
            throw new ServerError(401, 'Email no verificado')
        }
        
        const is_same_password = await bcrypt.compare(password, user.password)
        if(!is_same_password){
            throw new ServerError(401, 'Contraseña incorrecta')
        }

        const authorization_token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            },
            ENVIRONMENT.JWT_SECRET_KEY,
            {
                expiresIn: '7d'
            }
        )

        return {
            authorization_token
        }
    }

    static async resetPassword(email, newPassword) {
        // Validar que el usuario existe
        const user = await UserRepository.getByEmail(email)
        if(!user){
            throw new ServerError(404, 'Email no registrado')
        }

        // Validar que el email esté verificado
        if(!user.verified_email){
            throw new ServerError(401, 'Debes verificar tu email antes de reestablecer la contraseña')
        }

        // Validar longitud de contraseña
        if(!newPassword || newPassword.length < 8){
            throw new ServerError(400, 'La contraseña debe tener al menos 8 caracteres')
        }

        // Hashear nueva contraseña
        const newPasswordHashed = await bcrypt.hash(newPassword, 12)

        // Actualizar contraseña en la base de datos
        await UserRepository.updatePassword(email, newPasswordHashed)

        await transporter.sendMail({
            from: ENVIRONMENT.GMAIL_USERNAME,
            to: email,
            subject: 'Contraseña reestablecida - Slack Clon',
            html: `
            <h1>Contraseña reestablecida exitosamente</h1>
            <p>Hola ${user.name},</p>
            <p>Tu contraseña ha sido reestablecida exitosamente.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <br/>
            <p>Saludos,<br/>El equipo de Slack Clon</p>
            `
        })

        return {
            message: 'Contraseña reestablecida exitosamente'
        }
    }
}

export default AuthService