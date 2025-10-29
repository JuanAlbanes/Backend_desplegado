import express from "express";
import ChannelRepository from "../repositories/channel.repository.js";
import authMiddleware from "../middleware/auth.middleware.js";

const channel_router = express.Router();

channel_router.get("/:workspaceId/channels", authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const channels = await ChannelRepository.getAllByWorkspace(workspaceId);
        res.status(200).json(channels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener canales" });
    }
});

channel_router.post("/:workspaceId/channels", authMiddleware, async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name } = req.body;
        const newChannel = await ChannelRepository.create(workspaceId, name);
        res.status(201).json(newChannel);
    } catch (error) {
        res.status(500).json({ message: "Error al crear canal" });
    }
});

export default channel_router;
