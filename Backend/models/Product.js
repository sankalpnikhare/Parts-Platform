const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  shopAddress: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  imageUrl: String,
  rare: { type: Boolean, default: false },


  category: { type: String, required: true }  
  
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
