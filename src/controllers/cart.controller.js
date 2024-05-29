const TicketModel = require("../models/ticket.model.js");
const UserModel = require("../models/user.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const { generateUniqueCode, calcularTotal } = require("../utils/cartutils.js");

class CartController {
    async newCart(req, res) {
        try {
            const newCart = await cartRepository.crearCarrito();
            res.json({ status: "success", message: "Carrito creado correctamente", newCart });
        } catch (error) {
            req.logger.error("Error al crear un nuevo carrito: ", error);
            res.status(500).json({ status: "error", message: "Error al crear un nuevo carrito", details: error.message });
        }
    }

    async obtenerProductosDeCarrito(req, res) {
        const carritoId = req.params.cid;
        try {
            const productos = await cartRepository.obtenerProductosDeCarrito(carritoId);
            if (!productos) {
                return res.status(404).json({ error: "Carrito inexistente o id invalido" });
            }
            res.json(productos);
        } catch (error) {
            req.logger.error("Error al obtener productos del carrito: ", error);
            res.status(500).json({ status: "error", message: "Error al obtener productos del carrito", details: error.message });
        }
    }

    async agregarProductoEnCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        try {
            await cartRepository.agregarProducto(cartId, productId, quantity);
            const carritoID = (req.user.cart).toString();
            res.redirect(`/carts/${carritoID}`)
        } catch (error) {
            req.logger.error("Error al agregar producto al carrito: ", error);
            res.status(500).json({ status: "error", message: "Error al agregar producto al carrito", details: error.message });
        }
    }

    async eliminarProductoDeCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        try {
            const updatedCart = await cartRepository.eliminarProducto(cartId, productId);
            res.json({ status: "success", message: "Producto eliminado del carrito correctamente", updatedCart });
        } catch (error) {
            req.logger.error("Error al eliminar el producto del carrito: ", error);
            res.status(500).json({ status: "error", message: "Error al eliminar el producto del carrito", details: error.message });
        }
    }

    async actualizarProductosEnCarrito(req, res) {
        const cartId = req.params.cid;
        // Se debe enviar un array de productos en el cuerpo de la solicitud
        const updatedProducts = req.body;
        try {
            const updatedCart = await cartRepository.actualizarProductosEnCarrito(cartId, updatedProducts);
            res.json({ status: "success", message: "Producto en carrito actualizado correctamente", updatedCart });
        } catch (error) {
            req.logger.error("Error al actualizar producto en carrito: ", error);
            res.status(500).json({ status: "error", message: "Error al actualizar producto en carrito", details: error.message });
        }
    }

    async actualizarCantidad(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        try {
            const updatedCart = await cartRepository.actualizarCantidadesEnCarrito(cartId, productId, newQuantity);
            res.json({ status: "success", message: "Cantidad del producto actualizada correctamente", updatedCart });
        } catch (error) {
            req.logger.error("Error al actualizar la cantidad de productos: ", error);
            res.status(500).json({ status: "error", message: "Error al actualizar la cantidad de productos", details: error.message });
        }
    }

    async vaciarCarrito(req, res) {
        const cartId = req.params.cid;
        try {
            const updatedCart = await cartRepository.vaciarCarrito(cartId);
            res.json({ status: "success", message: "Todos los productos del carrito fueron eliminados correctamente", updatedCart });
        } catch (error) {
            req.logger.error("Error al vaciar el carrito: ", error);
            res.status(500).json({ status: "error", message: "Error al vaciar el carrito", details: error.message });
        }
    }

    async finalizarCompra(req, res) {
        const cartId = req.params.cid;
        try {
            // Obtenemos el carrito
            const cart = await cartRepository.obtenerProductosDeCarrito(cartId);
            // Obtenemos los productos
            const products = cart.products;
            // Inicializamos un array vacio para almacenar los futuros productos no disponibles
            const productosNoDisponibles = [];
            // Verificamos el stock y actualizamos los productos disponibles
            for (const item of products) {
                const productId = item.product;
                const product = await productRepository.obtenerProductoPorId(productId);
                if (product.stock >= item.quantity) {
                    // Si contamos con stock restamos la cantidad del producto
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    // Si no contamos con stock suficiente, agregamos el id del producto al array productosNoDisponibles
                    productosNoDisponibles.push(productId);
                }
            }
            const userWithCart = await UserModel.findOne({ cart: cartId });
            // Creamos un ticket con los datos de la compra
            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calcularTotal(cart.products),
                purchaser: userWithCart._id
            });
            await ticket.save();
            // Eliminamos del carrito los productos que si se compraron
            cart.products = cart.products.filter(item => productosNoDisponibles.some(productId => productId.equals(item.product)));
            // Guardamos el carrito actualizado en la base de datos
            await cart.save();
            res.status(200).json({ message: "Los siguientes productos no se facturaron por falta de stock", productosNoDisponibles });
        } catch (error) {
            req.logger.error("Error al procesar la compra: ", error);
            res.status(500).json({ status: "error", message: "Error al procesar la compra", details: error.message });
        }
    }

}

module.exports = CartController;