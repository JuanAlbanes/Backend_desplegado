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

    static async getAllWorkspaces(request, response) {
        try {
            // Obtener TODOS los workspaces sin filtrar por usuario
            const allWorkspaces = await WorkspacesRepository.getAll();
            
            response.json(
                {
                    status: 'OK',
                    message: 'Lista completa de espacios de trabajo obtenida correctamente',
                    data: {
                        workspaces: allWorkspaces
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
            // Usar url_image que es el nombre correcto según el modelo
            const name = request.body.name
            const url_image = request.body.url_image || request.body.url_img // Soporta ambos por compatibilidad
            
            // Validar name
            if (!name || typeof (name) !== 'string' || name.length > 30) {
                throw new ServerError(
                    400,
                    "el campo 'name' debe ser un string de menos de 30 caracteres"
                )
            }
            
            // Validar url_image (ahora opcional y con longitud más realista)
            if (url_image && typeof (url_image) !== 'string') {
                throw new ServerError(
                    400,
                    "el campo 'url_image' debe ser un string"
                )
            }
            
            // Crear el workspace con el nombre de campo correcto
            const workspace_id_created = await WorkspacesRepository.createWorkspace(
                name, 
                url_image, // ← Campo corregido
                request.user.id
            )
            
            console.log("Workspace creado con ID:", workspace_id_created)
            
            if (!workspace_id_created) {
                throw new ServerError(
                    500,
                    'Error al crear el workspace'
                )
            }
            
            await MemberWorkspaceRepository.create(request.user.id, workspace_id_created, 'admin')
            
            return response.status(201).json({
                ok: true,
                status: 201,
                message: 'Workspace creado con exito'
            })
        }
        catch (error) {
            console.log(error)
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

    static async update(request, response) {
        try {
            const workspace_id = request.params.workspace_id
            const { name, url_image } = request.body
            const user_id = request.user.id

            if (validarId(workspace_id)) {
                // Verificar que el usuario es admin del workspace
                const member = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(user_id, workspace_id)
                
                if (!member || member.role !== 'admin') {
                    throw new ServerError(403, 'No tienes permisos para actualizar este workspace')
                }

                // Validar campos
                if (name && (typeof name !== 'string' || name.length > 30)) {
                    throw new ServerError(400, "el campo 'name' debe ser un string de menos de 30 caracteres")
                }

                if (url_image && typeof url_image !== 'string') {
                    throw new ServerError(400, "el campo 'url_image' debe ser un string")
                }

                const updatedWorkspace = await WorkspacesRepository.update(workspace_id, { name, url_image })
                
                if (!updatedWorkspace) {
                    throw new ServerError(404, `Workspace con id ${workspace_id} no encontrado`)
                }

                return response.json({
                    ok: true,
                    message: 'Workspace actualizado correctamente',
                    data: {
                        workspace: updatedWorkspace
                    }
                })
            }
            else {
                throw new ServerError(400, 'el workspace_id debe ser un id valido')
            }
        }
        catch (error) {
            console.log(error)
            if (error.status) {
                return response.status(error.status).json({
                    ok: false,
                    status: error.status,
                    message: error.message
                })
            }
            else {
                return response.status(500).json({
                    ok: false,
                    status: 500,
                    message: 'Error interno del servidor'
                })
            }
        }
    }

    static async delete(request, response) {
        try {
            const workspace_id = request.params.workspace_id
            const user_id = request.user.id

            if (validarId(workspace_id)) {
                // Verificar que el usuario es admin del workspace
                const member = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(user_id, workspace_id)
                
                if (!member || member.role !== 'admin') {
                    throw new ServerError(403, 'No tienes permisos para eliminar este workspace')
                }

                const deletedWorkspace = await WorkspacesRepository.delete(workspace_id)
                
                if (!deletedWorkspace) {
                    throw new ServerError(404, `Workspace con id ${workspace_id} no encontrado`)
                }

                return response.json({
                    ok: true,
                    message: 'Workspace eliminado correctamente',
                    data: {
                        workspace: deletedWorkspace
                    }
                })
            }
            else {
                throw new ServerError(400, 'el workspace_id debe ser un id valido')
            }
        }
        catch (error) {
            console.log(error)
            if (error.status) {
                return response.status(error.status).json({
                    ok: false,
                    status: error.status,
                    message: error.message
                })
            }
            else {
                return response.status(500).json({
                    ok: false,
                    status: 500,
                    message: 'Error interno del servidor'
                })
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

            const id_inviter = member._id
            const invite_token = jwt.sign(
                {
                    id_invited: user_invited._id,
                    email_invited: invited_email,
                    id_workspace: workspace._id,
                    id_inviter: id_inviter
                },
                ENVIRONMENT.JWT_SECRET_KEY,
                {
                    expiresIn: '7d'
                }
            )

            console.log('Enviando email...');
            //Enviar mail de invitacion al usuario invitado

            await transporter.sendMail(
                {
                    from: ENVIRONMENT.GMAIL_USERNAME,
                    to: invited_email,
                    subject: 'Invitacion al workspace',
                    html: `<h1>El usuario: ${user.email} te ha enviado una invitación
                            al workspace ${workspace.name}<h1/> 
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