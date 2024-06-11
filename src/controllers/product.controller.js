const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository;
const EmailManager = require("../services/nodemailer.js");
const emailManager = new EmailManager;

class ProductController {
    async addProduct(req, res) {
        const newProduct = req.body;
        try {
            const result = await productRepository.agregarProducto(newProduct);
            res.json({ status: "success", message: "Producto agregado correctamente", result });
        } catch (error) {
            req.logger.error("Error al agregar producto: ", error);
            res.status(500).json({ status: "error", message: "Error al agregar producto", details: error.message });
        }
    }

    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;
            const products = await productRepository.obtenerProductos(limit, page, sort, query);
            res.json({ status: "success", message: "Productos obtenidos correctamente", products });
        } catch (error) {
            req.logger.error("Error al obtener los productos: ", error);
            res.status(500).json({ status: "error", message: "Error al obtener los prodcutos", details: error.message });
        }
    }

    async getProductById(req, res) {
        const id = req.params.pid;
        try {
            const finded = await productRepository.obtenerProductoPorId(id);
            if (!finded) {
                return res.json({ status: "error", message: "Producto no encontrado" });
            }
            res.json({ status: "success", message: "Producto encontrado", finded });
        } catch (error) {
            req.logger.error("Error al buscar el producto por ID: ", error);
            res.status(500).json({ status: "error", message: "Error al buscar el producto por ID", details: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.pid;
            const updatedProduct = req.body;
            const result = await productRepository.actualizarProducto(id, updatedProduct);
            res.json({ status: "success", message: "Producto actualizado correctamente", result });
        } catch (error) {
            req.logger.error("Error al actualizar el producto: ", error);
            res.status(500).json({ status: "error", message: "Error al actualizar el producto", details: error.message });
        }
    }

    async deleteProduct(req, res) {
        const id = req.params.pid;
        try {
            const producto = await productRepository.obtenerProductoPorId(id);
            if (!producto) {
                return res.status(404).json({ status: "error", message: "Producto no encontrado" });
            }
            const usuario = await userRepository.findById(producto.owner);
            if (usuario && usuario.role === "premium") {
                await emailManager.sendEmail({
                    to: usuario.email,
                    subject: "Producto eliminado",
                    html: `<p>Estimado ${usuario.first_name},</p>
                           <p>Le informamos que su producto "${producto.name}" ha sido eliminado del catálogo.</p>`
                });
            }
            let responseDel = await productRepository.eliminarProducto(id);
            res.json({ status: "success", message: "Producto eliminado correctamente", responseDel });
        } catch (error) {
            req.logger.error("Error al eliminar el producto: ", error);
            res.status(500).json({ status: "error", message: "Error al eliminar el producto", details: error.message });
        }
    }
}

module.exports = ProductController; 