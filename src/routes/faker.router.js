const express = require("express");
const router = express.Router();
const {userGenerate, productsGenerate} = require("../utils/faker.utils.js");

router.get("/", (req, res) => {
    const allProducts = [];

    for(i = 0; i < 100; i++) {
        allProducts.push(productsGenerate());
    }
    res.json(allProducts);
});

module.exports = router;
