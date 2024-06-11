const UserModel = require("../models/user.model.js");

class AdminController {
    async renderAdminUsers(req, res) {
        try {
            const users = await UserModel.find({}, "first_name last_name email role");
            res.render("admin-users", { users });
        } catch (error) {
            req.logger.error("Error al obtener usuarios para el admin: ", error);
            res.status(500).json({ status: "error", message: "Error al obtener usuarios para el admin", details: error.message });
        }
    }
}

module.exports = AdminController;