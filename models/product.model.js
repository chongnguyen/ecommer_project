const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
    oldPrice: Number,
    genres: String,
    quantum: Number,
    sku: String,
    shopId: String,
    date: Date,
    address: String,
    isShow: { type: Boolean, default: true },
});

ProductSchema.index({ name: 'text' });
ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
