import MessageRepository from "../repositories/channelMessage.repository.js"
import ChannelRepository from "../repositories/channel.repository.js"
import { ServerError } from "../utils/customError.utils.js"
import { validarId } from "../utils/validations.utils.js"

class MessageController {

    static async getAllByChannel(req, res) {
        try {
            const { channel_id } = req.params

            if (!validarId(channel_id)) {
                throw new ServerError(400, 'El channel_id debe ser un ID válido')
            }

            const channel = await ChannelRepository.getById(channel_id)
            if (!channel) {
                throw new ServerError(404, `No existe un canal con id ${channel_id}`)
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
}

export default MessageController
