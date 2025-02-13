const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    unique: true,
    required: true
  },
  initialAmount: {
    type: Number,
    required: true
  },
  currentBalance: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  state: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
