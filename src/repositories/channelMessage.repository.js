import MessageModel from "../models/ChannelMessage.model.js"

class MessageRepository {

    static async getAllByChannel(channel_id) {
        return await MessageModel.find({ channel_id }).populate("user_id", "username")
    }

    static async createMessage(channel_id, user_id, text) {
        const message = new MessageModel({
            channel_id,
            user_id,
            text,
            createdAt: new Date()
        })
        await message.save()
        return message
    }
}

export default MessageRepository
