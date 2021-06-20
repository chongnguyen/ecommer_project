const User = require('../models/user.model');
const Product = require('../models/product.model');

module.exports.userName = async (req, res, next) => {
	let id = req.signedCookies.userId;
	let listProduct = [];
	let user = await User.findOne({ _id: id, verified: true });
	if (user) {
		let cart = JSON.parse(user.cart || '{}');
		let productsInCart = Object.keys(cart);
		let quantumInCart = Object.values(cart);
		if (productsInCart.length) {
			listProduct = await Product.find({ _id: { $in: productsInCart } });
		}

		res.locals.userName = user?.name || user?.phone;
		res.locals.userAvatar = user?.avatar || '/image/avatar-default.png';
		res.locals.quantum = quantumInCart || [];
	}

	res.locals.listProduct = listProduct;
	next();
}