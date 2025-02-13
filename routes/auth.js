
const { Router } = require('express');
const { check } = require('express-validator');

const { userRegister, userLogin, tokenValidate } = require('../controllers/auth.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const  router = Router();


router.post('/register',[
    check('fullName', 'The name is required').not().isEmpty(),
    check('email', 'The email is not valid').isEmail().not().isEmpty(),
    check('password', 'the password is required').not().isEmpty(),
    check('code', 'the code is required').not().isEmpty(),
    validarCampos
] ,userRegister);


router.post('/login', [
    check('email', 'The email not is valid').isEmail().not().isEmpty(),
    check('password', 'the password is required').not().isEmpty(),
    validarCampos
],userLogin);


router.post('/validate', [ validarJWT ], tokenValidate);


module.exports = router;