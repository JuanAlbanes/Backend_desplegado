import WorkspaceService from '../services/workspace.service.js'
import { ServerError } from "../utils/customError.utils.js"

class WorkspaceController {
    static async getAll(request, response) {
        try {
            const workspaces = await WorkspaceService.getUserWorkspaces(request.user.id)
            
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
            console.log('Error en WorkspaceController.getAll:', error)
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
            const allWorkspaces = await WorkspaceService.getAllWorkspaces()
            
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
            console.log('Error en WorkspaceController.getAllWorkspaces:', error)
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
            const workspace = await WorkspaceService.getWorkspaceById(workspace_id)

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
        catch (error) {
            console.log('Error en WorkspaceController.getById:', error)
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
            const name = request.body.name
            const url_image = request.body.url_image || request.body.url_img
            
            await WorkspaceService.createWorkspace(name, url_image, request.user.id)
            
            return response.status(201).json({
                ok: true,
                status: 201,
                message: 'Workspace creado con exito'
            })
        }
        catch (error) {
            console.log('Error en WorkspaceController.post:', error)
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

            const updatedWorkspace = await WorkspaceService.updateWorkspace(
                workspace_id, 
                { name, url_image }, 
                request.user.id
            )

            return response.json({
                ok: true,
                message: 'Workspace actualizado correctamente',
                data: {
                    workspace: updatedWorkspace
                }
            })
        }
        catch (error) {
            console.log('Error en WorkspaceController.update:', error)
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

            const deletedWorkspace = await WorkspaceService.deleteWorkspace(workspace_id, request.user.id)

            return response.json({
                ok: true,
                message: 'Workspace eliminado correctamente',
                data: {
                    workspace: deletedWorkspace
                }
            })
        }
        catch (error) {
            console.log('Error en WorkspaceController.delete:', error)
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

            await WorkspaceService.inviteMemberToWorkspace(workspace, user, member, invited_email)

            response.status(200).json({
                ok: true,
                status: 200,
                message:'Usuario invitado con exito',
                data: null
            })
        }
        catch (error) {
            console.log('Error en WorkspaceController.inviteMember:', error)
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