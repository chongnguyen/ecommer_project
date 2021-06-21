const fs = require('fs');

const User = require("../models/user.model");
const Product = require("../models/product.model");
const Bill = require("../models/bill.model");


module.exports.cart = async (req, res) => {
  let { userId } = req.signedCookies;
  let user = await User.findById({ _id: userId });
  let cart = JSON.parse(user.cart);
  let productsInCart = Object.keys(cart) || [];
  // let quantumInCart = Object.values(cart);
  let listProduct = await Product.find({ _id: { $in: productsInCart } }) || [];
  let queryParams = '';
  for(const key in cart){
    queryParams+= `${key}=${cart[key]}&`
  }
  res.render('users/cart', {
    listProduct,
    cart,
    queryParams,
  });
}

module.exports.purchase = async (req, res) => {
  let { userId } = req.signedCookies;
  let user = await User.findById({ _id: userId });
  let bills = await Bill.find({ buyerId: userId })
  let products = []
  let shops = []
  for (let i in bills) {
    products[i] = await Product.findById({ _id: bills[i].productId });
    shops[i] = await User.findOne({ _id: bills[i].shopId });
  }
  res.render('users/purchase', {
    bills,
    products,
    shops,
    user
  });
}

module.exports.removeItemCart = async (req, res) => {
  let { userId } = req.signedCookies;
  let { productId } = req.params;

  let user = await User.findById({ _id: userId });
  let cart = JSON.parse(user.cart);
  delete cart[productId];
  user.cart = JSON.stringify(cart);
  user.save();

  res.redirect('back');

}

module.exports.removeBill = async (req, res) => {
  let { billId } = req.params;
  const { userId } = req.signedCookies;
  await Bill.findOneAndDelete({
    _id: billId,
    buyerId: userId,
  });

  res.redirect('back');

}

module.exports.account = async (req, res) => {
  let id = req.signedCookies.userId;
  let user = await User.findById({ _id: id });
  res.render('users/account', {
    user
  });
}

module.exports.checkout = async (req, res) => {
  let { productId } = req.params;
  let { userId } = req.signedCookies;
  const cart = req.query;
  const productIds = Object.keys(cart);
  // const quantum = Object.values(cart);
  let products = await Product.find({ _id: productIds }) || {};
  let user = await User.findOne({ _id: userId }) || {};
  const totalPrice = products.reduce((a, b, index) => {
    b.sl = cart[b.id];
    return a + b.price * b.sl;
  }, 0);
  res.render('users/checkout', {
    products,
    user,
    totalPrice,
  });
}

module.exports.addToCart = async (req, res) => {
  let { productId } = req.params;
  const query = req.query;
  const quantum = Object.keys(query)[0];
  let { userId } = req.signedCookies;

  let user = await User.findOne({ _id: userId }) || {};

  if (user.cart) {
    cart = JSON.parse(user.cart);
  } else {
    cart = {}
  }

  if (cart[productId]) {
    cart[productId]+= quantum
  } else {
    cart[productId] = quantum;
  }

  user.cart = JSON.stringify(cart);
  await user.save();
  res.redirect('back');
}

module.exports.logout = (req, res) => {
  res.clearCookie('userId');
  res.redirect('/');
}

module.exports.postAccout = async (req, res) => {
  let id = req.signedCookies.userId;
  let user = await User.findById({ _id: id });

  let infoUser = { ...req.body };

  if (req.file) {
    //file removed
    const path = './public' + user.avatar;
    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
        return
      }
      console.log('Xoa rồi nhé');
    })
    user.avatar = req.file.path.slice(6);
  }
  for (let key in infoUser) {
    user[key] = infoUser[key]
  }

  console.log(user);
  user.save();

  res.redirect('back')
}

module.exports.postCheckout = async (req, res) => {
  const Bill = require('../models/bill.model.js');

  const cart = req.query;
  const productIds = Object.keys(cart);
  const quantum = Object.values(cart);
  const bills = [];
  // let { productId } = req.params;
  let buyerId = req.signedCookies.userId;
  let { note : notes } = req.body;
  let i = 0;
  for (const productId of productIds) {
    let product = await Product.findOne({ _id: productId }) || {};
    product.quantum = product.quantum - cart[productId];
    await product.save();
    bills.push({
      productId,
      shopId: product.shopId,
      buyerId,
      note: notes[i],
      date: new Date(),
      price: product.price * cart[productId],
      quantum: cart[productId],
      state: 0,
    });
    i++;
  }
  
  Bill.insertMany(bills, (err) => {
    if (err) {
      console.log(err)
      res.send("<script>alert('Đặt hàng thất bại! Vui lòng thử lại.'); location.assign('/');</script>")
      return;
    }
    // res.send("<script>alert('Đặt hàng thành công!'); location.assign('/');</script>")
    res.redirect('/');
  });
}

