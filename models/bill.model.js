const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    buyerId: String,
    shopId: String,
    price: Number,
    date: Date,
    note: String,
    state: Number, // 0 -> chờ xac nhận, 1 -> Đang giao hàng, 2 -> Đã giao hàng, 3 -> Đã hủy.
    quantum: Number,
    isShopRead: { type: Boolean, default: false },
    isBuyerRead: { type: Boolean, default: false },
});

const Bill = mongoose.model('Bill', BillSchema);

module.exports = Bill;
