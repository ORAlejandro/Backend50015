const express = require("express");
const router = express.Router();
const ViewsController = require("../controllers/view.controller.js");
const viewsController = new ViewsController();
const AdminController = require("../controllers/admin.controller.js");
const adminController = new AdminController;
const checkUserRole = require("../middleware/checkrole.js");
const passport = require("passport");

router.get("/products", checkUserRole(["usuario"]),passport.authenticate("jwt", { session: false }), viewsController.renderProducts);
router.get("/carts/:cid", viewsController.renderCart);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);
router.get("/realtimeproducts", checkUserRole(["admin", "premium"]), viewsController.renderRealTimeProducts);
router.get("/chat", checkUserRole(["usuario"]) ,viewsController.renderChat);
router.get("/", viewsController.renderHome);
router.get("/reset-password", viewsController.renderResetPassword);
router.get("/password", viewsController.renderCambioPassword);
router.get("/confirmacion-envio", viewsController.renderConfirmacion);
router.get("/panel-premium", viewsController.renderPremium);
router.get("/admin/users", passport.authenticate("jwt", { session: false }), checkUserRole(["admin"]), adminController.renderAdminUsers);

module.exports = router;