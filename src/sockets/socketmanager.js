/*
const socket = require("socket.io");
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository(); 
const MessageModel = require("../models/message.model.js");

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer);
        this.initSocketEvents();
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Un cliente se conectó");
            
            socket.emit("productos", await productRepository.obtenerProductos() );

            socket.on("eliminarProducto", async (id) => {
                await productRepository.eliminarProducto(id);
                this.emitUpdatedProducts(socket);
            });

            socket.on("agregarProducto", async (producto) => {
                await productRepository.agregarProducto(producto);
                this.emitUpdatedProducts(socket);
            });

            socket.on("message", async (data) => {
                await MessageModel.create(data);
                const messages = await MessageModel.find();
                socket.emit("message", messages);
            });
        });
    }

    async emitUpdatedProducts(socket) {
        socket.emit("productos", await productRepository.obtenerProductos());
    }
}

module.exports = SocketManager;

*/
const socket = require("socket.io");
const ProductRepository = require("../repositories/product.repository.js");
const UserRepository = require("../repositories/user.repository.js");
const EmailManager = require("../services/nodemailer.js");
const productRepository = new ProductRepository();
const userRepository = new UserRepository();
const emailManager = new EmailManager();
const MessageModel = require("../models/message.model.js");

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer);
        this.initSocketEvents();
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Un cliente se conectó");
            
            socket.emit("productos", await productRepository.obtenerProductos());

            socket.on("eliminarProducto", async (id) => {
                // Obtener el producto
                const producto = await productRepository.obtenerProductoPorId(id);

                if (!producto) {
                    return socket.emit("error", "Producto no encontrado");
                }

                // Obtener el usuario propietario del producto
                const usuario = await userRepository.findById(producto.owner);

                if (usuario && usuario.role === "premium") {
                    // Enviar correo si el usuario es premium
                    await emailManager.sendProductDeletedMail(usuario.email, usuario.first_name, producto.name);
                }

                await productRepository.eliminarProducto(id);
                this.emitUpdatedProducts(socket);
            });

            socket.on("agregarProducto", async (producto) => {
                await productRepository.agregarProducto(producto);
                this.emitUpdatedProducts(socket);
            });

            socket.on("message", async (data) => {
                await MessageModel.create(data);
                const messages = await MessageModel.find();
                socket.emit("message", messages);
            });
        });
    }

    async emitUpdatedProducts(socket) {
        socket.emit("productos", await productRepository.obtenerProductos());
    }
}

module.exports = SocketManager;