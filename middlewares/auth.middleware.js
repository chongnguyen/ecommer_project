const User = require('../models/user.model');

module.exports.loginMiddleware = async function(req, res, next){
  // var user = req.cookies.userId;
  let id = req.signedCookies.userId;
  if(!id){
    console.log('chua login')
    res.redirect('/auth/login');
    return;
  } 
  let user = await User.findById({_id: id})
  if(!user){
      res.redirect('/auth/login');
      return;
  }
  next();
}