
const card = require("../models/card");


const generateCardNumber = async () => {
    let cardNumber;
    let exists = true;
    while (exists) {
        cardNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        exists = await card.findOne({ cardNumber });
    }
    return cardNumber;
};


module.exports = {
    generateCardNumber
}