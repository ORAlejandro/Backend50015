const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Success: Se conecto correctamente con MongoDB"))
    .catch(() => console.log("Failed: No se pudo conectar con MongoDB"))