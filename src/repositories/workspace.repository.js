import Workspaces from "../models/Workspace.model.js"

class WorkspacesRepository {
    static async createWorkspace(name, url_image, admin_id) {
        try {
            const result = await Workspaces.create({
                name: name,
                url_image: url_image,
                admin: admin_id
            })
            console.log('Workspace creado en BD:', result)
            return result._id
        } catch (error) {
            console.error('Error en createWorkspace:', error)
            throw error
        }
    }

    static async getAll() {
        try {
            const workspaces_get = await Workspaces.find({ active: true })
            return workspaces_get
        } catch (error) {
            console.error('Error en getAll:', error)
            throw error
        }
    }

    static async getById(workspaces_id) {
        try {
            const workspaces_found = await Workspaces.findById(workspaces_id)
            return workspaces_found
        } catch (error) {
            console.error('Error en getById:', error)
            throw error
        }
    }

    static async update(workspace_id, updateData) {
        try {
            const workspace_updated = await Workspaces.findByIdAndUpdate(
                workspace_id, 
                {
                    ...updateData,
                    modified_at: new Date()
                }, 
                {
                    new: true
                }
            )
            return workspace_updated
        } catch (error) {
            console.error('Error en update:', error)
            throw error
        }
    }

    static async delete(workspace_id) {
        try {
            // ✅ CORREGIDO: Usar soft delete cambiando active a false
            const workspace_deleted = await Workspaces.findByIdAndUpdate(
                workspace_id,
                { 
                    active: false,
                    modified_at: new Date()
                },
                { new: true }
            )
            return workspace_deleted
        } catch (error) {
            console.error('Error en delete:', error)
            throw error
        }
    }

    static async deleteById(workspaces_id) {
        try {
            // ✅ CORREGIDO: Usar soft delete en lugar de eliminar permanentemente
            await Workspaces.findByIdAndUpdate(
                workspaces_id,
                { 
                    active: false,
                    modified_at: new Date()
                }
            )
            return true
        } catch (error) {
            console.error('Error en deleteById:', error)
            throw error
        }
    }

    static async updateById(workspaces_id, new_values) {
        try {
            const workspace_updated = await Workspaces.findByIdAndUpdate(
                workspaces_id, 
                {
                    ...new_values,
                    modified_at: new Date()
                }, 
                {
                    new: true
                }
            )
            return workspace_updated
        } catch (error) {
            console.error('Error en updateById:', error)
            throw error
        }
    }

    // ✅ AÑADIDO: Método para obtener workspaces por admin
    static async getByAdminId(admin_id) {
        try {
            const workspaces = await Workspaces.find({ 
                admin: admin_id, 
                active: true 
            })
            return workspaces
        } catch (error) {
            console.error('Error en getByAdminId:', error)
            throw error
        }
    }
}

export default WorkspacesRepository