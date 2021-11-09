const User = require('../models/user.model');
const md5 = require('md5');

module.exports.register = (req, res) => {
    res.render('auths/register', {
        values: '',
    });
};

module.exports.login = (req, res) => {
    res.render('auths/login', {
        values: '',
    });
};

module.exports.verifyCode = (req, res) => {
    res.render('auths/verifyCode', {});
};
module.exports.forgotPassword = (req, res) => {
    res.render('auths/forgotPassword', {});
};
module.exports.resetPassword = (req, res) => {
    res.render('auths/resetPassword', {});
};

module.exports.postRegister = async (req, res) => {
    let { phone } = req.body,
        password = md5(req.body.password),
        verifyCode = generatorCode(),
        verified = false;
    const newPhone = phone.replace(0, '+84');
    const existsPhone = await User.findOne({ phone: newPhone, verified: true });
    if (existsPhone) {
        res.render('auths/register', {
            errs: ['Số điện thoại đã được sử dụng'],
            values: {
                phone,
            },
        });
        return;
    }

    const user = await User.findOneAndUpdate(
        {
            phone: newPhone,
        },
        { verified, password, verifyCode },
        { upsert: true, new: true }
    );
    user.sendMessage(verifyCode, newPhone);

    if (req.signedCookies.userId) {
        userName;
    }
    res.redirect('/auth/verifyCode');
    // res.send('<script>alert("Dang ky thanh cong!"); location.assign("/auth/login")</script>')
};

module.exports.postLogin = async (req, res) => {
    try {
        let { phone, password } = req.body;
        phone = phone.replace(0, '+84');
        let user = await User.findOne({
            phone,
            password: md5(password),
            verified: true,
        });
        if (!user) {
            res.render('auths/login', {
                errs: ['Sai tài khoản hoặc mật khẩu!'],
                values: req.body,
            });
            return;
        }
        res.cookie('userId', user._id, { signed: true });
        res.redirect('/');
    } catch (e) {
        res.end();
        return e;
    }
};

module.exports.postVerifyCode = async (req, res) => {
    let { verifyCode } = req.body;
    let user = await User.findOne({ verifyCode, verified: false });
    if (!user) {
        res.send(
            '<script>alert("Sai mã xác nhận! Vui long kiểm tra lại"); location.assign("/auth/verifyCode")</script>'
        );
        return;
    }
    user.verified = true;
    user.verifyCode = undefined;
    user.save();
    res.send(
        '<script>alert("Dang ky thanh cong!"); location.assign("/auth/login")</script>'
    );
};
module.exports.postVerifyForgot = async (req, res) => {
    let { verifyCode } = req.body;
    let user = await User.findOne({ verifyCode, verified: true });
    if (!user) {
        res.send(
            '<script>alert("Sai mã xác nhận! Vui long kiểm tra lại"); location.assign("/auth/verifyCode")</script>'
        );
        return;
    }
    user.verifyCode = undefined;
    await user.save();
    res.redirect(`/auth/forgot/resetPassword?phone=${user.phone}`);
};

module.exports.postForgotPassword = async (req, res) => {
    const phone = req.body.phone.replace(0, '+84');
    let user = await User.findOne({ phone, verified: true });
    if (!user) {
        res.render('auths/forgotPassword', {
            errs: ['Số điện thoại chưa đăng ký'],
            values: req.body,
        });
        return;
    }
    // const verifyCode = generatorCode();
    user.verifyCode = '1234';
    await user.save();
    res.redirect('/auth/forgot/verifyCode');
};
module.exports.postResetPassword = async (req, res) => {
    const { password, confirm } = req.body;
    const phone = req.query.phone.replace(' ', '+');
    const errs = [];
    if (password !== confirm) {
        errs.push('Mật khẩu không khớp!');
    }
    if (password.length < 8) {
        errs.push('Mật khẩu tối thiểu 8 ký tự');
    }
    if (errs.length) {
        res.render('auths/resetPassword', {
            values: req.body,
            errs,
        });
        return;
    }
    let user = await User.findOne({ phone, verified: true });
    user.password = md5(req.body.password);
    if (!user) {
        res.render('auths/resetPassword.pug', {
            errs: ['user not found'],
            values: req.body,
        });
        return;
    }
    await user.save();
    res.redirect('/auth/login');
};

// window.location.assign("/")
function generatorCode() {
    return Math.round(Math.random() * 8999 + 1000);
}
