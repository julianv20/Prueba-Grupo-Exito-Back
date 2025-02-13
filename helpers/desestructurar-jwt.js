

const jwt = require('jsonwebtoken');


const desestructurarJWT = ( token = '' ) => {
    
    // Decodifica el token JWT (esto solo funciona si tienes la clave secreta)
    const infoToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const { uid } = infoToken;

    return uid;

};



module.exports = {
    desestructurarJWT
}