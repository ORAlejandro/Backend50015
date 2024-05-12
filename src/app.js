const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
const cors = require("cors");
const path = require('path');
const PUERTO = 8080;
const addLogger = require("./utils/logger.js");
require("./database.js");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const fakerRouter = require("./routes/faker.router.js");

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(express.static("./src/public"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(addLogger);

//Passport 
app.use(passport.initialize());
initializePassport();
app.use(cookieParser());

//AuthMiddleware
const authMiddleware = require("./middleware/authmiddleware.js");
app.use(authMiddleware);

//Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//Rutas: 
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/", viewsRouter);
app.use("/mockingproducts", fakerRouter);
//Ruta para desafio:
app.get("/loggertest", (req, res) => {
    req.logger.error("Critical error");
    req.logger.warning("Warning!");
    req.logger.info("Informacion mediante logger");
    req.logger.debug("Mensaje debug");
    res.send("Ruta para testear Winston");
})

const httpServer = app.listen(PUERTO, () => {
    console.log(`Success: Servidor escuchando en http://localhost:${PUERTO}`);
});

///Websockets: 
const SocketManager = require("./sockets/socketmanager.js");
new SocketManager(httpServer);

