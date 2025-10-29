import express from "express";
import MessageRepository from "../repositories/channelMessage.repository.js";
import authMiddleware from "../middleware/auth.middleware.js";

const message_router = express.Router();

message_router.get("/:channelId/messages", authMiddleware, async (req, res) => {
    try {
        const { channelId } = req.params;
        const messages = await MessageRepository.getAllByChannel(channelId);
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener mensajes" });
    }
});

message_router.post("/:channelId/messages", authMiddleware, async (req, res) => {
    try {
        const { channelId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;
        const newMessage = await MessageRepository.create(channelId, userId, text);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: "Error al enviar mensaje" });
    }
});

export default message_router;
