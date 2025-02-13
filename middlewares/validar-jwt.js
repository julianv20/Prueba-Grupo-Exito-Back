const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const validarJWT = async (req = request, res = response, next) => {
    const token = req.header('token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        // Verify and decode the token
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user corresponding to the uid
        const user = await User.findById(uid);

        if (!user) {
            return res.status(401).json({
                ok: false,
                msg: 'Token invalido - Usuario no existe en la DB'
            });
        }

        // Check if the user's state is active
        if (!user.state) {
            return res.status(401).json({
                ok: false,
                msg: 'Token invalido - Usuario inactivo'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token invalido'
        });
    }
};

module.exports = {
    validarJWT
};
