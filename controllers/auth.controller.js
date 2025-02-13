
const { request, response } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');

const { generarJWT } = require('../helpers/generar-jwt');
const { desestructurarJWT } = require('../helpers/desestructurar-jwt');


const userRegister = async (req = request, res = response) => {
    const { fullName, email, password, code } = req.body;

    try {
        if (code !== process.env.CODE_CONFIRMATION) {
            return res.status(400).json({
                ok: false,
                msg: 'El código de confirmación es incorrecto'
            });
        }

        const emailExistente = await User.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo electrónico ya está registrado'
            });
        }

        const user = new User({ fullName, email, password });

        const salt = bcryptjs.genSaltSync();
        user.password = bcryptjs.hashSync(password, salt);

        await user.save();

        const token = await generarJWT(user.id);

        res.status(201).json({
            ok: true,
            msg: 'Usuario registrado exitosamente',
            token,
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};


const userLogin = async (req = request, res = response) => {
    const { email, password } = req.body;

    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Correo o contraseña incorrectos'
            });
        }

        // Verificar la contraseña
        const passwordValido = bcryptjs.compareSync(password, user.password);
        if (!passwordValido) {
            return res.status(400).json({
                ok: false,
                msg: 'Correo o contraseña incorrectos'
            });
        }

        // Generar JWT usando tu función personalizada
        const token = await generarJWT(user.id);

        res.status(200).json({
            ok: true,
            msg: 'Login exitoso',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    };
};



const tokenValidate = async (req = request, res = response) => {
    try {
        const token = req.header('token');
        const userId = desestructurarJWT(token);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: error.message || 'Error interno del servidor'
        });
    }
};



module.exports = { 
    userRegister,
    userLogin,
    tokenValidate
};
