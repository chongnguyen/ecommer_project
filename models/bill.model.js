const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  productId: String,
  buyerId: String,
  shopId: String,
  price: Number,
  date: Date,
  note: String,
  state: Number, // 0 -> chờ xac nhận, 1 -> Đang giao hàng, 2 -> Đã giao hàng, 3 -> Đã hủy.
  quantum: Number,
});

const Bill = mongoose.model('Bill', BillSchema);

module.exports = Bill;