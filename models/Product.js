const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  category: {
    type: String, required: true,
    enum: ['Football','Basketball','Cricket','Tennis','Fitness','Swimming']
  },
  image:  { type: String, required: true },
  stock:  { type: Number, default: 15 },
  rating: { type: Number, default: 4.5 }
});

module.exports = mongoose.model('Product', productSchema);
