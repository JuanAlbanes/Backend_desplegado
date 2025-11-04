import ChannelModel from "../models/Channel.model.js"

class ChannelRepository {
    static async getAllByWorkspace(workspace_id) {
        return await ChannelModel.find({ workspace: workspace_id }).populate('workspace')
    }

    static async getById(channel_id) {
        return await ChannelModel.findById(channel_id).populate('workspace')
    }

    static async createChannel({ name, description, workspace_id, private: isPrivate = false }) {
        const channel = new ChannelModel({
            name,
            description,
            workspace: workspace_id,
            private: isPrivate
        })
        await channel.save()
        return channel
    }

    static async update(channel_id, updateData) {
        const channel_updated = await ChannelModel.findByIdAndUpdate(
            channel_id, 
            {
                ...updateData,
                modified_at: new Date()
            }, 
            {
                new: true
            }
        ).populate('workspace')
        return channel_updated
    }

    static async delete(channel_id) {
        const channel_deleted = await ChannelModel.findByIdAndDelete(channel_id)
        return channel_deleted
    }
}

export default ChannelRepository
