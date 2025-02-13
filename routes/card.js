

const { Router } = require('express');
const { check } = require('express-validator');

const { createCard, deleteCard, getCard, getCards, getHistory } = require('../controllers/card.controller');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');


const  router = Router();

router.post('/create', [
    validarJWT,
], createCard);


router.delete('/delete', [
    check('id', 'The id is required').not().isEmpty(),
    validarCampos,
    validarJWT  
], deleteCard); 


router.post('/get-card', [
    check('id', 'The id is required').not().isEmpty(),
    validarCampos,
    validarJWT
], getCard);


router.post('/get-cards', [
    validarJWT
], getCards);


router.post('/history', [
    check('id', 'The id is required').not().isEmpty(),
    validarCampos,
    validarJWT
], getHistory);







module.exports = router;