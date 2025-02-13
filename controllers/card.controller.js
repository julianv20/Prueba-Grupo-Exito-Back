const { request, response } = require('express');

const Card = require('../models/card');
const User = require('../models/user');
const Transaction = require('../models/transaction');

const { desestructurarJWT } = require('../helpers/desestructurar-jwt');
const { generateCardNumber } = require('../helpers/generateCardNumber');


const createCard = async (req = request, res = response) => {
    try {
        const token = req.header('token');
        const userId = desestructurarJWT(token);

        const { cards, cardNumber, initialAmount } = req.body;

        let createdCards = [];

        // Check if it's an array of cards or a single card
        if (Array.isArray(cards)) {
            // Process each card to ensure they have a unique cardNumber and are not duplicates
            const processedCards = await Promise.all(cards.map(async (card) => {
                if (!card.cardNumber) {
                    card.cardNumber = await generateCardNumber();
                } else {
                    const existingCard = await Card.findOne({ cardNumber: card.cardNumber });
                    if (existingCard) {
                        throw new Error(`El número de tarjeta ${card.cardNumber} ya está en uso.`);
                    };
                };
                return { ...card, user: userId, currentBalance: card.initialAmount };
            }));

            createdCards = await Card.insertMany(processedCards);

            // Update the user with the IDs of the new cards
            const cardIds = createdCards.map(card => card._id);
            await User.findByIdAndUpdate(userId, { $push: { cards: { $each: cardIds } } });

            return res.status(201).json({
                ok: true,
                msg: 'Tarjetas creadas exitosamente',
            });
        };

        // Create a single card
        let generatedCardNumber = cardNumber;
        if (!generatedCardNumber) {
            generatedCardNumber = await generateCardNumber();
        } else {
            const existingCard = await Card.findOne({ cardNumber: generatedCardNumber });
            if (existingCard) {
                return res.status(400).json({
                    ok: false,
                    msg: `El número de tarjeta ${generatedCardNumber} ya está en uso.`
                });
            };
        };

        const newCard = new Card({ cardNumber: generatedCardNumber, initialAmount, currentBalance: initialAmount, user: userId });
        await newCard.save();

        // Update the user with the ID of the new card
        await User.findByIdAndUpdate(userId, { $push: { cards: newCard._id } });

        res.status(201).json({
            ok: true,
            msg: 'Tarjeta creada exitosamente',
        });

    } catch (error) {
        console.error('Error creando tarjeta(s):', error);
        res.status(400).json({
            ok: false,
            msg: error.message || 'Error interno del servidor'
        });
    };
};


const deleteCard = async (req = request, res = response) => {
    try {
        const { id } = req.body;

        // Buscar y desactivar la tarjeta por su ID
        const updatedCard = await Card.findByIdAndUpdate(
            id,
            { state: false },
            { new: true }
        );

        if (!updatedCard) {
            return res.status(404).json({
                ok: false,
                msg: 'Tarjeta no encontrada'
            });
        }

        res.status(200).json({
            ok: true,
            msg: 'Tarjeta desactivada exitosamente',
        });

    } catch (error) {
        console.error('Error desactivando tarjeta:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};


const getCard = async (req = request, res = response) => {
    try {
        const { id } = req.body;

        const card = await Card.findById(id).select('cardNumber initialAmount currentBalance createdAt').lean();

        if (!card) {
            return res.status(404).json({
                ok: false,
                msg: 'Tarjeta no encontrada'
            });
        }

        res.status(200).json({
            ok: true,
            card: {
                id: card._id,
                cardNumber: card.cardNumber,
                initialAmount: card.initialAmount,
                currentBalance: card.currentBalance,
                createdAt: card.createdAt.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error('Error obteniendo tarjeta:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};



const getCards = async (req = request, res = response) => {
    try {
        const token = req.header('token');
        const userId = desestructurarJWT(token);

        const cards = await Card.find({ user: userId, state: true })
            .select('cardNumber currentBalance createdAt')
            .lean();

        const formattedCards = cards.map(card => ({
            id: card._id,
            cardNumber: card.cardNumber,
            currentBalance: card.currentBalance,
            createdAt: card.createdAt.toISOString().split('T')[0]  // Format as YYYY-MM-DD
        }));

        res.status(200).json({
            cards: formattedCards
        });

    } catch (error) {
        console.error('Error obteniendo tarjetas:', error);
        res.status(500).json({
            msg: 'Error interno del servidor'
        });
    };
};



const getHistory = async (req = request, res = response) => {
    try {
        const { id } = req.body;  // Este es el _id de la tarjeta

        // Verificar si la tarjeta existe
        const card = await Card.findById(id);
        if (!card) {
            return res.status(404).json({
                ok: false,
                msg: 'Tarjeta no encontrada'
            });
        }

        // Buscar transacciones usando el _id de la tarjeta
        const transactions = await Transaction.find({ cardNumber: card._id })
            .select('description amount createdAt')
            .sort({ createdAt: -1 })
            .lean();

        const formattedTransactions = transactions.map(transaction => ({
            id: transaction._id,
            description: transaction.description,
            amount: transaction.amount,
            createdAt: transaction.createdAt.toISOString().split('T')[0]
        }));

        res.status(200).json({
            ok: true,
            transactions: formattedTransactions
        });

    } catch (error) {
        console.error('Error obteniendo el historial de transacciones:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};





module.exports = { 
    createCard,
    deleteCard,
    getCard,    
    getCards,
    getHistory
};
