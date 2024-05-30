const UserModel = require("../models/user.model.js");
const CartModel = require("../models/cart.model.js");
const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashbcryp.js");
const UserDTO = require("../dto/user.dto.js");
const generateRandomResetToken = require("../utils/tokenreset.js");
const EmailManager = require("../services/nodemailer.js");
const emailManager = new EmailManager;

class UserController {
    async register(req, res) {
        const { first_name, last_name, email, password, age } = req.body;
        try {
            const existeUsuario = await UserModel.findOne({ email });
            if (existeUsuario) {
                return res.status(400).json({ status: "error", message: "el usuario ya existe" });
            }
            //Creamos un nuevo cart 
            const nuevoCarrito = new CartModel();
            await nuevoCarrito.save();
            const nuevoUsuario = new UserModel({
                first_name,
                last_name,
                email,
                //Implementamos el nuevo cart
                cart: nuevoCarrito._id, 
                password: createHash(password),
                age
            });
            await nuevoUsuario.save();
            const token = jwt.sign({ user: nuevoUsuario }, "coderhouse", {
                expiresIn: "1h"
            });
            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });
            res.redirect("/api/users/profile");
        } catch (error) {
            req.logger.error("Error en el registro: ", error);
            res.status(500).json({ status: "error", message: "Error en el registro", details: error.message });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const usuarioEncontrado = await UserModel.findOne({ email });

            /* NOTA PARA EL TUTOR: Este admin hardcodeado no me funciona
            const admin = {
                first_name: "Coder",
                last_name: "House",
                age: 1,
                email: "adminCoder@coder.com",
                password: "adminCod3r123",
                role: "admin"
            }

            if(email == admin.email && password == admin.password) {
                const token = jwt.sign({ user: admin }, "coderhouse", {
                    expiresIn: "1h"
                });
    
                res.cookie("coderCookieToken", token, {
                    maxAge: 3600000,
                    httpOnly: true
                });

                return res.redirect("/api/users/profile");
            }
            */

            //Verificamos que el usuario exista
            if (!usuarioEncontrado) {
                return res.status(401).json({ status: "error", message: "Usuario invalido" });
            }
            const esValido = isValidPassword(password, usuarioEncontrado);
            //Verificamo que el password sea correcto
            if (!esValido) {
                return res.status(401).json({ status: "error", message: "Password invalido" });
            }
            const token = jwt.sign({ user: usuarioEncontrado }, "coderhouse", {
                expiresIn: "1h"
            });
            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });
            res.redirect("/api/users/profile");
        } catch (error) {
            req.logger.error("Error en el login: ", error);
            res.status(500).json({ status: "error", message: "error en el login", details: error.message });
        }
    }

    async profile(req, res) {
        try {
            const isPremium = req.user.role === "premium";
            const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role);
            const isAdmin = req.user.role === "admin";
            res.render("profile", { user: userDto, isPremium, isAdmin });
        } catch (error) {
            req.logger.error("Error en el profile: ", error);
            res.status(500).json({ status: "error", message: "error en el profile", details: error.message });
        }
    }

    async logout(req, res) {
        res.clearCookie("coderCookieToken");
        res.redirect("/login");
    }

    async admin(req, res) {
        if (req.user.user.role !== "admin") {
            return res.status(403).send("Acceso denegado");
        }
        res.render("admin");
    }

    async requestPasswordReset(req, res) {
        const { email } = req.body;
        try {
            //Buscamos el email
            const user = await UserModel.findOne({email});
            //Validamos si existe
            if (!user) {
                return res.status(404).json({ status: "error", message: "no existe un usuario con el email proporcionado" });
            }
            //Generamos el random token
            const token = generateRandomResetToken();
            //Almacenamos el nuevo token
            user.resetToken = {
                token: token,
                expiresAt: new Date(Date.now() + 3600000)
            };
            await user.save();
            //Enviamos el mail
            await emailManager.sendRestorePasswordMail(email, user.first_name, token);
            res.redirect("/confirmacion-envio");
        } catch (error) {
            req.logger.error("Error en el request password: ", error);
            res.status(500).json({ status: "error", message: "Error en el request password", details: error.message });
        }
    }

    async resetPassword(req, res) {
        const { email, password, token } = req.body;
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.render("generatenewpassword", { error: "El email no coincide con ningun usuario" });
            }
            //Validamos el token de reestablecimiento
            const resetToken = user.resetToken;
            if (!resetToken || resetToken.token !== token) {
                return res.render("resetpassword", { error: "El token de restablecimiento de contraseña es inválido" });
            }
            //Validamos que el token no haya expirado
            const currently = new Date();
            if (currently > resetToken.expiresAt) {
                return res.redirect("/generatenewpassword");
            }
            //Validamos que no se intente restablecer el password con la anterior
            if (isValidPassword(password, user)) {
                return res.render("generatenewpassword", { error: "La nueva contraseña no puede ser igual a la anterior" });
            }
            //Actualizamos la pw
            user.password = createHash(password);
            //Inutilizamos el token
            user.resetToken = undefined;
            await user.save();
            return res.redirect("/login");
        } catch (error) {
            req.logger.error("Error en el reset password: ", error);
            return res.status(500).render("passwordreset", { error: "error interno del servidor" });
        }
    }

    async switchRolePremium(req, res) {
        try {
            const { uid } = req.params;
            const user = await UserModel.findById(uid);
            if(!user) {
                return res.status(404).json({ status: "error", message: "Usuario inexistente" });
            }
            const newRole = user.role === "usuario" ? "premium" : "usuario";
            const updated = await UserModel.findByIdAndUpdate(uid, { role: newRole }, { new: true });
            res.json({ status: "success", updated });
        } catch (error) {
            req.logger.error("Error en el switch de roles: ", error);
            res.status(500).json({ status: "error", message: "error en el switch de roles", details: error.message });
        }
    }
}

module.exports = UserController;