import express from 'express'
import WorkspacesRepository from '../repositories/workspace.repository.js'
import { validarId } from '../utils/validations.utils.js'
import { ServerError } from '../utils/customError.utils.js'
import WorkspaceController from '../controllers/workspace.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import workspaceMiddleware from '../middleware/workspace.middleware.js'

const workspace_router = express.Router()

workspace_router.use(authMiddleware)

// Obtener workspaces del usuario actual
workspace_router.get('/', WorkspaceController.getAll)

// Obtener TODOS los workspaces sin filtrar
workspace_router.get('/all', WorkspaceController.getAllWorkspaces)

// Obtener workspace por ID
workspace_router.get('/:workspace_id', WorkspaceController.getById)

// Crear workspace (cualquier usuario autenticado puede crear)
workspace_router.post('/', WorkspaceController.post)

// Actualizar workspace (solo admin)
workspace_router.put('/:workspace_id', workspaceMiddleware(['admin']), WorkspaceController.update)

// Eliminar workspace (solo admin)
workspace_router.delete('/:workspace_id', workspaceMiddleware(['admin']), WorkspaceController.delete)

// Invitar miembro al workspace (solo admin)
workspace_router.post('/:workspace_id/invite', workspaceMiddleware(['admin']), WorkspaceController.inviteMember)

export default workspace_router