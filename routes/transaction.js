
const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');
const { payTransaction } = require('../controllers/transaction.controller');

const  router = Router();

router.post('/pay', [
    check('description', 'The desciption is required').not().isEmpty(),
    check('amount', 'The amount is required').isNumeric().not().isEmpty(),
    check('id', 'the id is required').not().isEmpty(),
    validarCampos,
    validarJWT,
], payTransaction);


module.exports = router;
