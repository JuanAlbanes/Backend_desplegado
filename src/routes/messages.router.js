import express from "express";
import MessageController from "../controllers/message.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const message_router = express.Router();

message_router.use(authMiddleware);

// Obtener todos los mensajes de un canal
message_router.get("/channel/:channel_id", MessageController.getAllByChannel);

// Obtener mensaje por ID
message_router.get("/:message_id", MessageController.getById);

// Crear mensaje en un canal
message_router.post("/", MessageController.post);

// Actualizar mensaje
message_router.put("/:message_id", MessageController.update);

// Eliminar mensaje
message_router.delete("/:message_id", MessageController.delete);

export default message_router;
