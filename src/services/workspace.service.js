import ENVIRONMENT from "../config/environment.config.js"
import transporter from "../config/mailer.config.js"
import MemberWorkspaceRepository from "../repositories/memberWorkspace.repository.js"
import UserRepository from "../repositories/user.repository.js"
import WorkspacesRepository from "../repositories/workspace.repository.js"
import { ServerError } from "../utils/customError.utils.js"
import { validarId } from "../utils/validations.utils.js"
import jwt from 'jsonwebtoken'

class WorkspaceService {
    static async getUserWorkspaces(userId) {
        const workspaces = await MemberWorkspaceRepository.getAllWorkspacesByUserId(userId)
        
        if (!workspaces) {
            throw new ServerError(404, 'No se encontraron workspaces para el usuario')
        }
        
        return workspaces
    }

    static async getAllWorkspaces() {
        const allWorkspaces = await WorkspacesRepository.getAll()
        return allWorkspaces
    }

    static async getWorkspaceById(workspaceId) {
        if (!validarId(workspaceId)) {
            throw new ServerError(400, 'el workspace_id debe ser un id valido')
        }

        const workspace = await WorkspacesRepository.getById(workspaceId)

        if (!workspace) {
            throw new ServerError(404, `Workspace con id ${workspaceId} no encontrado`)
        }

        return workspace
    }

    static async createWorkspace(name, url_image, userId) {
        // Validar name
        if (!name || typeof (name) !== 'string' || name.length > 30) {
            throw new ServerError(400, "el campo 'name' debe ser un string de menos de 30 caracteres")
        }
        
        // Validar url_image
        if (url_image && typeof (url_image) !== 'string') {
            throw new ServerError(400, "el campo 'url_image' debe ser un string")
        }
        
        // Crear el workspace
        const workspace_id_created = await WorkspacesRepository.createWorkspace(name, url_image, userId)
        
        console.log("Workspace creado con ID:", workspace_id_created)
        
        if (!workspace_id_created) {
            throw new ServerError(500, 'Error al crear el workspace')
        }
        
        // Agregar usuario como admin
        const memberCreated = await MemberWorkspaceRepository.create(userId, workspace_id_created, 'admin')
        
        if (!memberCreated) {
            throw new ServerError(500, 'Error al agregar usuario como admin del workspace')
        }
        
        return workspace_id_created
    }

    static async updateWorkspace(workspaceId, updates, userId) {
        if (!validarId(workspaceId)) {
            throw new ServerError(400, 'el workspace_id debe ser un id valido')
        }

        // Verificar que el usuario es admin del workspace
        const member = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(userId, workspaceId)
        
        if (!member || member.role !== 'admin') {
            throw new ServerError(403, 'No tienes permisos para actualizar este workspace')
        }

        // Validar campos
        if (updates.name && (typeof updates.name !== 'string' || updates.name.length > 30)) {
            throw new ServerError(400, "el campo 'name' debe ser un string de menos de 30 caracteres")
        }

        if (updates.url_image && typeof updates.url_image !== 'string') {
            throw new ServerError(400, "el campo 'url_image' debe ser un string")
        }

        const updatedWorkspace = await WorkspacesRepository.update(workspaceId, updates)
        
        if (!updatedWorkspace) {
            throw new ServerError(404, `Workspace con id ${workspaceId} no encontrado`)
        }

        return updatedWorkspace
    }

    static async deleteWorkspace(workspaceId, userId) {
        if (!validarId(workspaceId)) {
            throw new ServerError(400, 'el workspace_id debe ser un id valido')
        }

        // Verificar que el usuario es admin del workspace
        const member = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(userId, workspaceId)
        
        if (!member || member.role !== 'admin') {
            throw new ServerError(403, 'No tienes permisos para eliminar este workspace')
        }

        const deletedWorkspace = await WorkspacesRepository.delete(workspaceId)
        
        if (!deletedWorkspace) {
            throw new ServerError(404, `Workspace con id ${workspaceId} no encontrado`)
        }

        return deletedWorkspace
    }

    static async inviteMemberToWorkspace(workspace, user, member, invitedEmail) {
        // Buscar al usuario y validar que exista y este activo
        const user_invited = await UserRepository.getByEmail(invitedEmail)

        if (!user_invited) {
            throw new ServerError(404, 'Usuario no encontrado')
        }
        
        // Verificar que NO es miembro actual de ese workspace 
        const member_data = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(
            user_invited._id, workspace._id
        )

        if (member_data) {
            throw new ServerError(409, `Usuario con email ${invitedEmail} ya es miembro del workspace`)
        }

        const id_inviter = member._id
        const invite_token = jwt.sign(
            {
                id_invited: user_invited._id,
                email_invited: invitedEmail,
                id_workspace: workspace._id,
                id_inviter: id_inviter
            },
            ENVIRONMENT.JWT_SECRET_KEY,
            {
                expiresIn: '7d'
            }
        )

        console.log('Enviando email...');
        
        // Enviar mail de invitacion al usuario invitado
        await transporter.sendMail(
            {
                from: ENVIRONMENT.GMAIL_USERNAME,
                to: invitedEmail,
                subject: 'Invitacion al workspace',
                html: `<h1>El usuario: ${user.email} te ha enviado una invitación
                        al workspace ${workspace.name}<h1/> 
                <a href='${ENVIRONMENT.URL_API_BACKEND}/api/members/confirm-invitation/${invite_token}'>Click para aceptar<a/>`
            }
        )

        return { success: true }
    }
}

export default WorkspaceService