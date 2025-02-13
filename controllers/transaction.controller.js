const { request, response } = require('express');
const Card = require('../models/card');
const Transaction = require('../models/transaction');

const payTransaction = async (req = request, res = response) => {
    try {
        const { description, amount, id } = req.body;
        
        const card = await Card.findById(id);

        if (!card) {
            return res.status(404).json({
                ok: false,
                msg: 'La tarjeta no existe'
            });
        }

        if (amount > card.currentBalance) {
            return res.status(400).json({
                ok: false,
                msg: 'Saldo insuficiente para realizar el pago'
            });
        }

        const transaction = new Transaction({
            description,
            amount,
            cardNumber: card.id
        });
        await transaction.save();

        card.currentBalance -= amount;
        card.movements.push(transaction._id);
        await card.save();

        // Formatear la respuesta con solo los campos necesarios
        const formattedCard = {
            id: card._id,
            cardNumber: card.cardNumber,
            initialAmount: card.initialAmount,
            currentBalance: card.currentBalance,
            createdAt: card.createdAt.toISOString().split('T')[0]
        };


        res.status(201).json({
            ok: true,
            msg: 'Pago realizado exitosamente',
            card: formattedCard
        });

    } catch (error) {
        console.error('Error procesando el pago:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};

module.exports = { 
    payTransaction,
};