const nodemailer = require("nodemailer");

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: "ORAlejandro13@gmail.com",
                pass: "avpg okve czsp gtnx"
            }
        });
    }

    async sendPurchaseMail(email, first_name, ticket) {
        try {
            const mailOptions = {
                from: "Alumno Coderhouse <ORAlejandro13@gmail.com>",
                to: email,
                subject: "Gracias por comprar en nuestra tienda",
                html: `
                    <h1>Compra realizada con exito!</h1>
                    <p>Estamos preparando tu pedido, muchas gracias ${first_name}</p>
                    <p>El numero de tu ticket de compra es: ${ticket}</p>
                `
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error el intentar enviar el mail de compra: ", error);
        }
    }

    async sendRestorePasswordMail(email, first_name, token) {
        try {
            const mailOptions = {
                from: "TodoRopa Tienda Online <ORAlejandro13@gmail.com>",
                to: email,
                subject: "Reestablecer Password",
                html: `
                        <h1>Reestablece tu password</h1>
                        <p>Hola ${first_name}.</p>
                        <p>Solicitaste un reestablecimiento de password.</p>
                        <h2>Tu codigo para reestablecerlo:</h2>
                        <p>${token}</p>
                        <a href="http://localhost:8080/password">Restablecer Contraseña</a>
                        <p>Importante: Este codigo expira en 1 hora.</p>
                        <p>Si no solicitaste el reestablecimiento ignora este mail.</p>
                        <p>TodoRopa.</p>
                `
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error al intentar enviar el mail de reestablecimiento de password: ", error);
            throw new Error("Error al intentar enviar el mail de reestablecimiento");
        }
    }

    async sendDeletionMail(email, first_name) {
        try {
            const mailOptions = {
                from: "TodoRopa Tienda Online <ORAlejandro13@gmail.com>",
                to: email,
                subject: "Cuenta eliminada por inactividad",
                html: `
                    <h1>Cuenta eliminada</h1>
                    <p>Hola ${first_name},</p>
                    <p>Tu cuenta ha sido eliminada debido a la inactividad de los ultimos 2 dias.</p>
                    <p>Tu email podra volver a utilizarse para un futuro registro.</p>
                    <p>TodoRopa.</p>
                `
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error al intentar enviar el correo de eliminación: ", error);
            throw new Error("Error al intentar enviar el correo de eliminación");
        }
    }

    async sendProductDeletedMail(email, first_name, productName) {
        try {
            const mailOptions = {
                from: "TodoRopa Tienda Online <ORAlejandro13@gmail.com>",
                to: email,
                subject: "Producto Eliminado",
                html: `
                    <h1>Producto Eliminado</h1>
                    <p>Hola ${first_name}.</p>
                    <p>Te informamos que tu producto <strong>${productName}</strong> ha sido eliminado de nuestro catálogo.</p>
                    <p>Gracias por tu comprensión.</p>
                    <p>TodoRopa.</p>
                `
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error al intentar enviar el mail de producto eliminado: ", error);
            throw new Error("Error al intentar enviar el mail de producto eliminado");
        }
    }
}

module.exports = EmailManager;