require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

// Define Router
const authRouter = require('./routers/auth.router');
const userRouter = require('./routers/user.router');
const productRouter = require('./routers/product.router');
const sellerRouter = require('./routers/seller.router');
const searchRouter = require('./routers/search.router');
const apiRouter = require('./routers/authorizaiton.router');

// middlewares
const userName = require('./middlewares/username.middleware');
const authMiddleware = require('./middlewares/auth.middleware');
// const authorizationMiddleware = require('./middlewares/authorization.middleware');

const app = express();

// getting-started.js
let connectString = 'mongodb://localhost:27017/ecommmer';
if (process.env.NODE_ENV === 'production') {
    connectString = `mongodb+srv://ecommer:${process.env.PASSWORD}@ecommer.w6zqa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
}
mongoose.connect(connectString, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('Connect success!');
});

// Config
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan('dev'));

// Middleware use for all router
app.use(userName.userName);

const port = process.env.PORT || 3000;

app.use('/', productRouter);
app.use('/search', searchRouter);
app.use('/auth', authRouter);
app.use('/user', authMiddleware.loginMiddleware, userRouter);
app.use('/seller', authMiddleware.loginMiddleware, sellerRouter);
app.use('/api', authMiddleware.loginMiddleware, apiRouter);

app.listen(port, () =>
    console.log(`Server listen at http://localhost:${port}`)
);

// todo: find product, bill, purcharse
// todo: filter bill.....
// todo: cancel bill.....

//! HANDLE STATE OF BILL.
//! ADD FORGOT PASSWORD
// CAP NHAT STATUS CUA DON HANG TRONG TRANG KHACH HANG
// TICH HOP THANH TOAN ONLINE
