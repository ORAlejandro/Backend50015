const CartModel = require("../models/cart.model.js");

class CartRepository {
    async crearCarrito() {
        try {
            const newCart = new CartModel({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            throw new Error("Failed: Error al crear el carrito");
        }
    }

    async obtenerProductosDeCarrito(idCarrito) {
        try {
            const cart = await CartModel.findById(idCarrito);
            if (!cart) {
                console.log("Failed: Carrito inexistente o id invalido");
                return null;
            }
            return cart;
        } catch (error) {
            throw new Error("Failed: Error al obtener productos del carrito");
        }
    }

    async agregarProducto(cartId, productId, quantity = 1) {
        try {
            const carrito = await this.obtenerProductosDeCarrito(cartId);
            const existeProducto = carrito.products.find(item => item.product._id.toString() === productId);
            if (existeProducto) {
                existeProducto.quantity += quantity;
            } else {
                carrito.products.push({ product: productId, quantity });
            }
            carrito.markModified("products");
            await carrito.save();
            return carrito;
        } catch (error) {
            throw new Error("Failed: Error al agregar producto");
        }
    }

    async eliminarProducto(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error("Failed: Carrito inexistente o id invalido");
            }
            cart.products = cart.products.filter(item => item.product._id.toString() !== productId);
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error("Failed: Error al eliminar un producto");
        }
    }

    async actualizarProductosEnCarrito(cartId, updatedProducts) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error("Failed: Carrito inexistente o id invalido");
            }
            cart.products = updatedProducts;
            cart.markModified("products");
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error("Failed: Error al actualizar los productos en carrito");
        }
    }

    async actualizarCantidadesEnCarrito(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error("Failed: Carrito inexistente o id invalido");
            }
            const productIndex = cart.products.findIndex(item => item._id.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity;
                cart.markModified("products");
                await cart.save();
                return cart;
            } else {
                throw new Error("Failed: Producto no encontrado en el carrito");
            }
        } catch (error) {
            throw new Error("Failed: Error al actualizar las cantidades");
        }
    }

    async vaciarCarrito(cartId) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            );
            if (!cart) {
                throw new Error("Failed: Carrito inexistente o id invalido");
            }
            return cart;
        } catch (error) {
            throw new Error("Failed: Error al vaciar el carrito");
        }
    }
}

module.exports = CartRepository;