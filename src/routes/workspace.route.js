import express from 'express'
import WorkspacesRepository from '../repositories/workspace.repository.js'
import { validarId } from '../utils/validations.utils.js'
import { ServerError } from '../utils/customError.utils.js'
import WorkspaceController from '../controllers/workspace.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import workspaceMiddleware from '../middleware/workspace.middleware.js'


const workspace_router = express.Router()

workspace_router.use(authMiddleware)


workspace_router.get('/',  WorkspaceController.getAll )

<<<<<<< HEAD
//Nueva ruta para obtener TODOS los workspaces sin filtrar
workspace_router.get('/all',  WorkspaceController.getAllWorkspaces )

=======
>>>>>>> f19d43587651dedf8a37e1af262f29c431debe55

workspace_router.get('/:workspace_id', /* workspaceMiddleware(['admin']) */ WorkspaceController.getById )

//Crear el WorkspaceController con los metodos .post, .getById, getAll

//Este es el endpoint para crear workspaces
workspace_router.post('/:workspace_id/invite' , workspaceMiddleware(['admin']), WorkspaceController.inviteMember)


workspace_router.post('/' ,  WorkspaceController.post)




export default workspace_router