import jwt from 'jsonwebtoken'
import ENVIRONMENT from '../config/environment.config.js'
import { ServerError } from '../utils/customError.utils.js'
import MemberWorkspaceRepository from '../repositories/memberWorkspace.repository.js'

class MemberController {
    static async confirmInvitation(request, response) {
        try {
            const { token } = request.params
            const {
                id_invited,
                email_invited,
                id_workspace,
                id_inviter
            } = jwt.verify(token, ENVIRONMENT.JWT_SECRET_KEY)
            console.log(id_invited,email_invited,id_workspace,id_inviter)

            await MemberWorkspaceRepository.create(id_invited, id_workspace, 'user')

            response.redirect(`${ENVIRONMENT.URL_FRONTEND}/register`) 
        }
        catch (error) {
            console.log(error)
            if(error instanceof jwt.JsonWebTokenError) {
                response.status(400).json({ ok: false, status: 400, message: 'Token invalido' })
            }
            else if( error instanceof jwt.TokenExpiredError) {
                response.status(400).json({ ok: false, status: 400, message: 'Token expirado' })
            }
            else if( error.status ){
                response.status(error.status).json({ ok: false, status: error.status, message: error.message })
            }
            else {
                response.status(500).json({ ok: false, status: 500, message: 'Error interno del servidor' })
            }
        }
    }
}

export default MemberController


