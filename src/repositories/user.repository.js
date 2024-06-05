const UserModel = require("../models/user.model.js");

class UserRepository {
    async findByEmail(email) {
        try {
            return await UserModel.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            return await UserModel.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async create(user) {
        try {
            return await user.save();
        } catch (error) {
            throw error;
        }
    }

    async save(user) {
        try {
            return await user.save();
        } catch (error) {
            throw error;
        }
    }

    async updateUserRole(userId, newRole) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error("Usuario inexistente");
            }
            const requiredDocuments = ["Documento de Identificacion", "Comprobante monotributo/RI", "Comprobante de cuenta bancaria"];
            const userDocuments = user.documents.map(doc => doc.name);
            const hasRequiredDocuments = requiredDocuments.every(doc => userDocuments.includes(doc));
            if (!hasRequiredDocuments) {
                throw new Error("La siguiente documentacion es requerida: Documento de Identificacion, Comprobante monotributo/RI, Comprobante de cuenta bancaria");
            }
            return await UserModel.findByIdAndUpdate(userId, { role: newRole }, { new: true });
        } catch (error) {
            throw error;
        }
    }

}
module.exports = UserRepository;