//Las funciones que se encargaran de manejar la consulta y la respuesta

import ENVIRONMENT from "../config/environment.config.js"
import transporter from "../config/mailer.config.js"
import MemberWorkspaceRepository from "../repositories/memberWorkspace.repository.js"
import UserRepository from "../repositories/user.repository.js"
import WorkspacesRepository from "../repositories/workspace.repository.js"
import { ServerError } from "../utils/customError.utils.js"
import { validarId } from "../utils/validations.utils.js"
import jwt from 'jsonwebtoken'

class WorkspaceController {
    static async getAll(request, response) {
        try {
            const workspaces = await MemberWorkspaceRepository.getAllWorkspacesByUserId(request.user.id)
            response.json(
                {
                    status: 'OK',
                    message: 'Lista de espacios de trabajo obtenida correctamente',
                    data: {
                        workspaces: workspaces
                    }
                }
            )
        }
        catch (error) {
            console.log(error)
            //Evaluamos si es un error que nosotros definimos
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

    static async getById(request, response) {
        try {
            const workspace_id = request.params.workspace_id

            if (validarId(workspace_id)) {
                const workspace = await WorkspacesRepository.getById(workspace_id)

                if (!workspace) {

                    throw new ServerError(
                        400,
                        `Workspace con id ${workspace_id} no encontrado`
                    )
                }
                else {

                    return response.json(
                        {
                            ok: true,
                            message: `Workspace con id ${workspace._id} obtenido`,
                            data: {
                                workspace: workspace
                            }
                        }
                    )
                }
            }
            else {
                throw new ServerError(
                    400,
                    'el workspace_id debe ser un id valido'
                )
            }
        }
        catch (error) {
            console.log(error)
            //Evaluamos si es un error que nosotros definimos
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

    static async post(request, response) {
        try {

            //request.body es donde esta la carga util enviada por el cliente
            //si aplicamos express.json() en nuestra app body siempre sera de tipo objeto
            const name = request.body.name
            const url_img = request.body.url_img
            //Validar que name este y que sea valido (por ejemplo un string no VACIO de no mas de 30 caracteres)
            if (!name || typeof (name) !== 'string' || name.length > 30) {
                throw new ServerError(
                    400,
                    "el campo 'name' debe ser un string de menos de 30 caracteres"
                )
            }
            else if (!url_img || typeof (url_img) !== 'string') {
                throw new ServerError(
                    400,
                    "el campo 'url_img' debe ser un string de menos de 30 caracteres"
                )
            }
            else {
                //Creamos el workspace con el repository
                const workspace_id_created = await WorkspacesRepository.createWorkspace(name, url_img)
                if (!workspace_id_created) {
                    throw new ServerError(
                        500,
                        'Error al crear el workspace'
                    )
                }
                await MemberWorkspaceRepository.create(request.user.id, workspace_id_created, 'admin')
                //Si todo salio bien respondemos con {ok: true, message: 'Workspace creado con exito'}
                return response.status(201).json({
                    ok: true,
                    status: 201,
                    message: 'Workspace creado con exito'
                })
            }
        }
        catch (error) {
            console.log(error)
            //Evaluamos si es un error que nosotros definimos
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

    static async inviteMember(request, response) {
        try {
            const { member, workspace, user } = request
            const { invited_email } = request.body

            //Buscar al usuario y validar que exista y este activo
            const user_invited = await UserRepository.getByEmail(invited_email)

            if (!user_invited) {
                throw new ServerError(404, 'Usuario no encontrado')
            }
            //Verificar que NO es miembro actual de ese workspace 
            const member_data = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(
                user_invited._id, workspace._id
            )

            if (member_data) {
                throw new ServerError(409, `Usuario con email ${invited_email} ya es miembro del workspace`)
            }

            /* Crear un token con {
                id_invitado,
                id_workspace,
                id_invitador
            } CON JWT
            */
            const id_inviter = member.id
            const invite_token = jwt.sign(
                {
                    id_invited: user_invited.id,
                    email_invited: invited_email,
                    id_workspace: workspace.id,
                    id_inviter: id_inviter
                },
                ENVIRONMENT.JWT_SECRET_KEY,
                {
                    expiresIn: '7d'
                }
            )

            //Enviar mail de invitacion al usuario invitado


            await transporter.sendMail(
                {
                    from: ENVIRONMENT.GMAIL_USERNAME,
                    to: invited_email,
                    subject: 'Invitacion al workspace',
                    html: `<h1>El usuario: ${user.email} te ha enviado una invitación
                            al workspace ${workspace.nombre}<h1/>
                <a href='${ENVIRONMENT.URL_API_BACKEND}/api/members/confirm-invitation/${invite_token}'>Click para aceptar<a/>`
                }
            )

            response.status(200).json({
                ok: true,
                status: 200,
                message:'Usuario invitado con exito',
                data: null
            })

        }
        catch (error) {
            console.log(error)
            //Evaluamos si es un error que nosotros definimos
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

export default WorkspaceController