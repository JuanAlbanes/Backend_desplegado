import ChannelModel from "../models/Channel.model.js"

class ChannelRepository {
    static async getAllByWorkspace(workspace_id) {
        return await ChannelModel.find({ workspace_id })
    }

    static async getById(channel_id) {
        return await ChannelModel.findById(channel_id)
    }

    static async createChannel({ name, description, workspace_id }) {
        const channel = new ChannelModel({
            name,
            description,
            workspace_id,
            createdAt: new Date()
        })
        await channel.save()
        return channel
    }
}

export default ChannelRepository
