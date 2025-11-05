import express from "express";
import ChannelController from "../controllers/channel.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const channel_router = express.Router();

// Aplicar autenticación a todas las rutas
channel_router.use(authMiddleware);

// Obtener todos los canales de un workspace
channel_router.get("/workspace/:workspace_id", ChannelController.getAllByWorkspace);

// Obtener canal por ID
channel_router.get("/:channel_id", ChannelController.getById);

// Crear canal en un workspace
channel_router.post("/", ChannelController.post);

// Actualizar canal
channel_router.put("/:channel_id", ChannelController.update);

// Eliminar canal
channel_router.delete("/:channel_id", ChannelController.delete);

export default channel_router;