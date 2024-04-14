const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://aleortega:coderhouse@cluster0.oprbhbr.mongodb.net/ecommerce50015?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Success: Se conecto correctamente con MongoDB"))
    .catch(() => console.log("Failed: No se pudo conectar con MongoDB"))
    