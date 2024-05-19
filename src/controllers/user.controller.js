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
                return res.status(400).send("El usuario ya existe");
            }

            //Creo un nuevo carrito: 
            const nuevoCarrito = new CartModel();
            await nuevoCarrito.save();

            const nuevoUsuario = new UserModel({
                first_name,
                last_name,
                email,
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
            console.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const usuarioEncontrado = await UserModel.findOne({ email });

            /*
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
            if (!usuarioEncontrado) {
                return res.status(401).send("Usuario no válido");
            }

            const esValido = isValidPassword(password, usuarioEncontrado);
            if (!esValido) {
                return res.status(401).send("Contraseña incorrecta");
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
            req.logger.error("Critial error from catch login controller")
            //console.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    /*
    async profile(req, res) {
        //Con DTO: 
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role);
        const isAdmin = req.user.role === 'admin';
        res.render("profile", { user: userDto, isAdmin });
    }
    */

    async profile(req, res) {
        try {
            const isPremium = req.user.role === "premium";
            const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role);
            const isAdmin = req.user.role === "admin";
            res.render("profile", { user: userDto, isPremium, isAdmin });
        } catch (error) {
            res.status(500).send('Error interno del servidor');
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
        const {email} = req.body;
        try {
            //Busco el email en la db
            const user = await UserModel.findOne({email});
            //Valido si existe
            if (!user) {
                return res.status(404).send("No existe miembro con ese email");
            }
            //Aca genero el token random
            const token = generateRandomResetToken();
            //Guardo el nuevo token en el usuario
            user.resetToken = {
                token: token,
                expiresAt: new Date(Date.now() + 3600000)
            };
            //Guardo en la db
            await user.save();
            //Envio el mail
            await emailManager.sendRestorePasswordMail(email, user.first_name, token);

            res.redirect("/confirmacion-envio");
        } catch (error) {
            console.error("Error: ", error);
            res.status(500).send("Internal Server Error");
        }
    }

    async resetPassword(req, res) {
        const {email, password, token} = req.body;
        try {
            //Busco el usuario
            const user = await UserModel.findOne({ email });
            //Valido que no exista
            if (!user) {
                return res.render("generatenewpassword", {error: "El email no coincide con ningun usuario"});
            }
            //Valido el token de reestablecimiento
            const resetToken = user.resetToken;
            if (!resetToken || resetToken.token !== token) {
                return res.render("resetpassword", {error: "El token de restablecimiento de contraseña es inválido"});
            }
            //Valido que el token no haya expirado
            const currently = new Date();
            if (currently > resetToken.expiresAt) {
                return res.redirect("/generatenewpassword");
            }
            //Valido que no quiera reestablecer la pw con la actual
            if (isValidPassword(password, user)) {
                return res.render("generatenewpassword", { error: "La nueva contraseña no puede ser igual a la anterior" });
            }

            //Actualizo la pw
            user.password = createHash(password);
            //Dejo useless el token
            user.resetToken = undefined;
            await user.save();
            
            return res.redirect("/login");
        } catch (error) {
            console.error(error);
            return res.status(500).render("passwordreset", { error: "Error interno del servidor" });
        }
    }

    async switchRolePremium(req, res) {
        try {
            //Tomo el ID del usuario
            const {uid} = req.params;
            //Lo busco en la db
            const user = await UserModel.findById(uid);
            //Corroboro que exista
            if(!user) {
                return res.status(404).json({ status: "failed", message: "Usuario inexistente" });
            }
            //Guardo en una variable el nuevo valor
            const newRole = user.role === "usuario" ? "premium" : "usuario";
            //Implemento el nuevo valor al perfil del usuario
            const updated = await UserModel.findByIdAndUpdate(uid, { role: newRole }, { new: true });
            res.json(updated);
        } catch (error) {
            console.error("Error en el switch de roles: ", error);
            res.status(500).json({ status: "failed", message: "Internal server error" });
        }
    }
}

module.exports = UserController;
