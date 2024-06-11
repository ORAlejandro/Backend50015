const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controller.js");
const userController = new UserController();
const uploadMulter = require("../middleware/multer.js");
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository;

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);
router.post("/logout", userController.logout.bind(userController));
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);
router.post("/requestPasswordReset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.put("/premium/:uid", userController.switchRolePremium);
router.post("/:uid/documents", uploadMulter.fields([
    { name: "document" }, { name: "products" }, { name: "profile" }]), async (req, res) => {
        const { uid } = req.params;
        const uploadedDocuments = req.files;
        try {
            const user = await userRepository.findById(uid);
            if (!user) {
                return res.status(404).send("Usuario inexistente");
            }
            if (uploadedDocuments) {
                if (uploadedDocuments.document) {
                    user.documents = user.documents.concat(uploadedDocuments.document.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })));
                }
                if (uploadedDocuments.products) {
                    user.documents = user.documents.concat(uploadedDocuments.products.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })));
                }
                if (uploadedDocuments.profile) {
                    user.documents = user.documents.concat(uploadedDocuments.profile.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })));
                }
            }
            await user.save();
            res.status(200).json({ status: "success", message: "Archivo subidos correctamente" });
        } catch (error) {
            req.logger.error("Error router multer: ", error);
            res.status(500).json({ status: "error", message: "Error router multer", details: error.message });
        }
    })
router.get("/", userController.getAllUsers);
router.delete("/", userController.deleteInactiveUsers);

module.exports = router;