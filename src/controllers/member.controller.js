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


/* import jwt from 'jsonwebtoken'
import ENVIRONMENT from '../config/environment.config.js'
import { ServerError } from '../utils/customError.utils.js'
import MemberWorkspaceRepository from '../repositories/memberWorkspace.repository.js'

class MemberController {
    static async confirmInvitation(request, response) {
        try {
            console.log('=== DECODIFICANDO TOKEN ===');
            const { token } = request.params;
            console.log('Token completo recibido:', token);
            
            // PASO 1: Decodificar SIN verificar primero para ver el contenido
            const decodedWithoutVerify = jwt.decode(token);
            console.log('Contenido del token (decodificado SIN verificar):', decodedWithoutVerify);
            
            // PASO 2: Ahora verificar con la clave secreta
            console.log('Verificando token con JWT_SECRET_KEY...');
            const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET_KEY);
            console.log('Token verificado correctamente:', decoded);

            const {
                id_invited,
                email_invited,
                id_workspace,
                id_inviter
            } = decoded;

            console.log('IDs extraídos:');
            console.log('- id_invited:', id_invited);
            console.log('- email_invited:', email_invited);
            console.log('- id_workspace:', id_workspace);
            console.log('- id_inviter:', id_inviter);

            // PASO 3: Verificar que los IDs sean válidos para MongoDB
            console.log('Validando formato de IDs...');
            if (!id_invited || !id_workspace || !id_inviter) {
                throw new ServerError(400, 'Faltan datos en el token');
            }

            // Continuar con el proceso normal...
            console.log('Creando membresía...');
            await MemberWorkspaceRepository.create(id_invited, id_workspace, 'user');
            console.log('Membresía creada exitosamente');

            console.log('Redirigiendo a frontend...');
            response.redirect(`${ENVIRONMENT.URL_FRONTEND}/register`);
            
        }
        catch (error) {
            console.log('=== ERROR EN CONFIRMACIÓN ===');
            console.log('Tipo de error:', error.constructor.name);
            console.log('Mensaje de error:', error.message);
            console.log('Stack trace completo:', error.stack);
            
            if(error instanceof jwt.JsonWebTokenError) {
                console.log('Token JWT inválido');
                response.status(400).json({ ok: false, status: 400, message: 'Token invalido' });
            }
            else if( error instanceof jwt.TokenExpiredError) {
                console.log('Token expirado');
                response.status(400).json({ ok: false, status: 400, message: 'Token expirado' });
            }
            else if( error.status ){
                console.log('Error personalizado:', error.message);
                response.status(error.status).json({ ok: false, status: error.status, message: error.message });
            }
            else {
                console.log('Error interno del servidor - Detalles arriba ↑');
                response.status(500).json({ ok: false, status: 500, message: 'Error interno del servidor' });
            }
        }
    }
}

export default MemberController */