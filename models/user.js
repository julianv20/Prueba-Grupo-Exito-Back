const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    cards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
    }],
    state: {
      type: Boolean,
      default: true
    }
  }, { timestamps: true });  // Añade campos createdAt y updatedAt automáticamente

module.exports = mongoose.model('User', userSchema);
