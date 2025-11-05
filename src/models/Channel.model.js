import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del canal es requerido'],
        trim: true,
        maxlength: [30, 'El nombre no puede tener más de 30 caracteres']
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: [200, 'La descripción no puede tener más de 200 caracteres']
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: [true, 'El workspace es requerido']
    },
    private: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date,
        default: null
    }
})

// Índices para mejor performance
channelSchema.index({ workspace: 1, name: 1 }, { unique: true }) // Nombre único por workspace
channelSchema.index({ workspace: 1, active: 1 }) // Búsqueda por workspace y estado

// Middleware para actualizar modified_at antes de guardar
channelSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.modified_at = new Date()
    }
    next()
})

const Channel = mongoose.model('Channel', channelSchema)

export default Channel