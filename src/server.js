import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongoDB.config.js";
import workspace_router from "./routes/workspace.route.js";
import channel_router from "./routes/channel.router.js"; 
import message_router from "./routes/messages.router.js";

connectMongoDB()

import express from 'express'
import auth_router from "./routes/auth.router.js";
import cors from 'cors'
import authMiddleware from "./middleware/auth.middleware.js";
import member_router from "./routes/member.router.js";

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/members', member_router)  
app.use('/api/auth', auth_router)
app.use('/api/workspaces', workspace_router)
app.use('/api/channels', channel_router) 
app.use('/api/messages', message_router) 

app.get('/api/members/test', (req, res) => {
    res.json({ message: 'Ruta de miembros funcionando correctamente' })
})

app.get('/ruta-protegida', authMiddleware, (request, response) => {
    console.log(request.user)
    response.send({
        ok: true
    })
})

app.listen(
    8080, 
    () => {
        console.log("Servidor funcionando en puerto 8080")
    }
)