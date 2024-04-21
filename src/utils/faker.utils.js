const {faker} = require("@faker-js/faker");

const productsGenerate = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        price: faker.commerce.price(),
        img: faker.image.avatarGitHub(),
        stock: parseInt(faker.string.numeric()),
        description: faker.commerce.productDescription(),
        code: faker.string.numeric(),
        category: faker.string.numeric()
    }
}

const userGenerate = () => {
    const quantityOfProducts = parseInt(faker.string.numeric());
    let cart = [];
    for(let i = 0; i < quantityOfProducts; i++) {
        cart.push(productsGenerate());
    }
    return {
        id: faker.database.mongodbObjectId(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        cart
    }
}

module.exports = {
    userGenerate,
    productsGenerate
};