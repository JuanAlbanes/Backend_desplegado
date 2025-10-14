import ChannelRepository from "../repositories/channel.repository.js"
import WorkspaceRepository from "../repositories/workspace.repository.js"
import { ServerError } from "../utils/customError.utils.js"
import { validarId } from "../utils/validations.utils.js"

class ChannelController {

    static async getAllByWorkspace(req, res) {
        try {
            const { workspace_id } = req.params

            if (!validarId(workspace_id)) {
                throw new ServerError(400, 'El workspace_id debe ser un ID válido')
            }

            const workspace = await WorkspaceRepository.getById(workspace_id)
            if (!workspace) {
                throw new ServerError(404, `No existe un workspace con id ${workspace_id}`)
            }

            const channels = await ChannelRepository.getAllByWorkspace(workspace_id)

            return res.status(200).json({
                ok: true,
                status: 200,
                message: `Canales del workspace ${workspace.name} obtenidos correctamente`,
                data: { channels }
            })

        } catch (error) {
            console.error(error)
            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                message: error.message || 'Error interno del servidor'
            })
        }
    }

    static async getById(req, res) {
        try {
            const { channel_id } = req.params

            if (!validarId(channel_id)) {
                throw new ServerError(400, 'El channel_id debe ser un ID válido')
            }

            const channel = await ChannelRepository.getById(channel_id)
            if (!channel) {
                throw new ServerError(404, `No existe un canal con id ${channel_id}`)
            }

            return res.status(200).json({
                ok: true,
                status: 200,
                message: `Canal con id ${channel._id} obtenido correctamente`,
                data: { channel }
            })

        } catch (error) {
            console.error(error)
            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                message: error.message || 'Error interno del servidor'
            })
        }
    }
    static async post(req, res) {
        try {
            const { name, description, workspace_id } = req.body

            if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 30) {
                throw new ServerError(400, "El campo 'name' debe ser un string no vacío de menos de 30 caracteres")
            }

            if (!workspace_id || !validarId(workspace_id)) {
                throw new ServerError(400, "Debe enviarse un 'workspace_id' válido")
            }

            const workspace = await WorkspaceRepository.getById(workspace_id)
            if (!workspace) {
                throw new ServerError(404, `No existe un workspace con id ${workspace_id}`)
            }
            const newChannel = await ChannelRepository.createChannel({
                name: name.trim(),
                description: description?.trim() || '',
                workspace_id
            })

            return res.status(201).json({
                ok: true,
                status: 201,
                message: `Canal '${newChannel.name}' creado correctamente en el workspace ${workspace.name}`,
                data: { channel: newChannel }
            })
        } catch (error) {
            console.error(error)
            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                message: error.message || 'Error interno del servidor'
            })
        }
    }
}

export default ChannelController
