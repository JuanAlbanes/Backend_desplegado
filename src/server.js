/* import ENVIRONMENT from "./config/environment.config.js";
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
) */

import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongoDB.config.js";
import workspace_router from "./routes/workspace.route.js";
import channel_router from "./routes/channel.router.js";
import message_router from "./routes/messages.router.js";
import express from 'express'
import auth_router from "./routes/auth.router.js";
import cors from 'cors'
import authMiddleware from "./middleware/auth.middleware.js";
import member_router from "./routes/member.router.js";

connectMongoDB()

const app = express()

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://frontend-wine-iota-90.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ];

        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS bloqueado para origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    const allowedOrigins = [
        'https://frontend-wine-iota-90.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ];
    const requestOrigin = req.headers.origin;

    if (allowedOrigins.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', auth_router)

app.use('/api/members', authMiddleware, member_router)
app.use('/api/workspaces', authMiddleware, workspace_router)
app.use('/api/channels', authMiddleware, channel_router)
app.use('/api/messages', authMiddleware, message_router)


app.get('/api/members/test', (req, res) => {
    res.json({ message: 'Ruta de miembros funcionando correctamente' })
})


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/ruta-protegida', authMiddleware, (request, response) => {
    console.log(request.user)
    response.send({
        ok: true,
        user: request.user,
        message: 'Ruta protegida funcionando'
    })
})

app.get('/', (req, res) => {
    res.json({
        message: 'Slack Clone API',
        version: '1.0',
        environment: process.env.NODE_ENV || 'development',
        docs: 'Ver documentación para más detalles'
    });
});


app.use((err, req, res, next) => {
    console.error('Error global:', err);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS Error',
            message: 'Origin not allowed'
        });
    }

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});


app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log("🚀 Servidor funcionando en puerto", PORT)
    console.log("🌍 Environment:", process.env.NODE_ENV || 'development')
    console.log("🔗 Frontend URL:", process.env.URL_FRONTEND || 'http://localhost:5173')
    console.log("🔗 Backend URL:", process.env.URL_API_BACKEND || `http://localhost:${PORT}`)
    console.log("📧 Gmail User:", process.env.GMAIL_USERNAME || 'Not configured')
})