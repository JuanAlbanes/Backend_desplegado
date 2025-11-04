import MessageRepository from "../repositories/channelMessage.repository.js"
import ChannelRepository from "../repositories/channel.repository.js"
import MemberWorkspaceRepository from "../repositories/memberWorkspace.repository.js"
import { ServerError } from "../utils/customError.utils.js"
import { validarId } from "../utils/validations.utils.js"

class MessageController {

    static async getAllByChannel(req, res) {
        try {
            const { channel_id } = req.params
            const user_id = req.user.id

            if (!validarId(channel_id)) {
                throw new ServerError(400, 'El channel_id debe ser un ID válido')
            }

            const channel = await ChannelRepository.getById(channel_id)
            if (!channel) {
                throw new ServerError(404, `No existe un canal con id ${channel_id}`)
            }

            // Verificar que el usuario es miembro del workspace del canal
            const isMember = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(user_id, channel.workspace)
            if (!isMember) {
                throw new ServerError(403, 'No tienes acceso a este canal')
            }

            const messages = await MessageRepository.getAllByChannel(channel_id)

            return res.status(200).json({
                ok: true,
                status: 200,
                message: `Mensajes del canal '${channel.name}' obtenidos correctamente`,
                data: { messages }
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
            const { message_id } = req.params
            const user_id = req.user.id

            if (!validarId(message_id)) {
                throw new ServerError(400, 'El message_id debe ser un ID válido')
            }

            const message = await MessageRepository.getById(message_id)
            if (!message) {
                throw new ServerError(404, `No existe un mensaje con id ${message_id}`)
            }

            // Verificar que el usuario es miembro del workspace del canal del mensaje
            const channel = await ChannelRepository.getById(message.channel)
            const isMember = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(user_id, channel.workspace)
            if (!isMember) {
                throw new ServerError(403, 'No tienes acceso a este mensaje')
            }

            return res.status(200).json({
                ok: true,
                status: 200,
                message: `Mensaje con id ${message._id} obtenido correctamente`,
                data: { message }
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
            const { channel_id, text } = req.body
            const user_id = req.user.id 

            if (!validarId(channel_id)) {
                throw new ServerError(400, 'El channel_id debe ser un ID válido')
            }

            if (!text || typeof text !== 'string' || text.trim() === '') {
                throw new ServerError(400, "El campo 'text' debe ser un string no vacío")
            }

            const channel = await ChannelRepository.getById(channel_id)
            if (!channel) {
                throw new ServerError(404, `No existe un canal con id ${channel_id}`)
            }

            // Verificar que el usuario es miembro del workspace del canal
            const isMember = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(user_id, channel.workspace)
            if (!isMember) {
                throw new ServerError(403, 'No tienes permisos para enviar mensajes en este canal')
            }

            const newMessage = await MessageRepository.createMessage(channel_id, user_id, text.trim())

            return res.status(201).json({
                ok: true,
                status: 201,
                message: `Mensaje creado correctamente en el canal '${channel.name}'`,
                data: { message: newMessage }
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

    static async update(req, res) {
        try {
            const { message_id } = req.params
            const { text } = req.body
            const user_id = req.user.id

            if (!validarId(message_id)) {
                throw new ServerError(400, 'El message_id debe ser un ID válido')
            }

            if (!text || typeof text !== 'string' || text.trim() === '') {
                throw new ServerError(400, "El campo 'text' debe ser un string no vacío")
            }

            const message = await MessageRepository.getById(message_id)
            if (!message) {
                throw new ServerError(404, `No existe un mensaje con id ${message_id}`)
            }

            // Verificar que el usuario es el autor del mensaje
            if (message.user.toString() !== user_id) {
                throw new ServerError(403, 'Solo puedes editar tus propios mensajes')
            }

            const updatedMessage = await MessageRepository.update(message_id, text.trim())

            return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Mensaje actualizado correctamente',
                data: { message: updatedMessage }
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

    static async delete(req, res) {
        try {
            const { message_id } = req.params
            const user_id = req.user.id

            if (!validarId(message_id)) {
                throw new ServerError(400, 'El message_id debe ser un ID válido')
            }

            const message = await MessageRepository.getById(message_id)
            if (!message) {
                throw new ServerError(404, `No existe un mensaje con id ${message_id}`)
            }

            // Verificar que el usuario es el autor del mensaje o admin del workspace
            const channel = await ChannelRepository.getById(message.channel)
            const member = await MemberWorkspaceRepository.getMemberWorkspaceByUserIdAndWorkspaceId(user_id, channel.workspace)
            
            const isAuthor = message.user.toString() === user_id
            const isAdmin = member && member.role === 'admin'

            if (!isAuthor && !isAdmin) {
                throw new ServerError(403, 'No tienes permisos para eliminar este mensaje')
            }

            const deletedMessage = await MessageRepository.delete(message_id)

            return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Mensaje eliminado correctamente',
                data: { message: deletedMessage }
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

export default MessageController