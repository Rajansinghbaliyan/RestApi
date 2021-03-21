const User = require('../model/user');
const jwt = require('jsonwebtoken');
const respond = require('../services/respond');
const sendMail = require('../util/email');
const crypto = require('crypto');

const createSendToken = (user, res, status, message) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //secure: true,
    httpOnly: true,
  };

  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token,cookieOptions);
  respond(res, status, message, token);
};

const signToken = (id) => {
  return jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signup = async (req, res, next) => {
  try {
    const data = req.body;
    const user = await User.create({
      name: data.name,
      email: data.email,
      photo: data.photo,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      passwordUpdatedAt: Date.now(),
    });

    createSendToken(user, res, 201, 'User is created');

    // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES_IN,
    // });

    // // res.status(201).json({
    // //   status: 'success',
    // //   token,
    // // });
    // respond(res, 201, 'success', token);
  } catch (err) {
    // res.status(400).json({
    //   status: 'fail',
    //   data: err.message,
    // });
    err.status = 400;
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new Error('Please enter the email and password');

    const user = await User.findOne({ email }).select('+password');
    //to select the password because it is select:false in model
    if (!user) throw new Error('Password or Email is incorrect');

    const isPasswordCorrect = await user.confirmPassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) throw new Error('Password or Email is incorrect');

    createSendToken(user, res, 200, 'User is logged in successfully');
    // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES_IN,
    // });

    // // res.status(200).json({
    // //   status: 'success',
    // //   token,
    // // });
    // respond(res, 201, 'success', token);
  } catch (err) {
    // res.status(401).json({
    //   status: 'fail',
    //   data: err.message,
    // });
    err.status = 401;
    return next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    console.log('Protect middleware is called');

    if (
      !req.headers.authorization &&
      !req.headers.authorization.startsWith('Bearer')
    )
      throw new Error('Please log in');

    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) throw new Error('Please Login again.');

    console.log(payload);
    const user = await User.findById(payload._id);

    if (!user) throw new Error('User Not found');

    const isPasswordChanged = user.passwordChanged(payload.iat);
    if (isPasswordChanged)
      throw new Error('Please log in again, your token has expired');

    req.user = user;
    next();
  } catch (err) {
    // res.status(401).json({ //401 is for not authorized
    //   status: 'fail token is not correct',
    //   data: err.message,
    // });
    err.status = 401;
    return next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role))
        throw new Error('You are not authenticated for this');
      next();
    } catch (err) {
      // res.status(403).json({  // 403 for forbidden request
      //   status: 'fail',
      //   message: err.message,
      // });
      err.status = 403;
      return next(err);
    }
  };
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Please enter the correct email');

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false }); //to save the changes in the current user

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await sendMail({
      email: user.email,
      subject: 'The reset password',
      //text: `Please click the url to change your pass word: /api/v1/users/resetPassword?resetToken=${resetToken}?email=${user.email}`
      text: resetUrl,
    });
    respond(res, 200, 'Reset Token is generated', resetToken);
  } catch (err) {
    err.status = 404; //not found
    return next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.resetToken;
    const { password, confirmPassword } = req.body;

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    if (!password || !confirmPassword)
      throw new Error('Please provide the password and confirm Password');

    const user = await User.findOne({ passwordResetToken: resetTokenHash });
    if (!user) throw new Error('Your token is not correct');

    const isTokenValid = user.checkResetToken(resetToken);
    if (!isTokenValid) throw new Error('Your token expired');

    user.updatePassword(password, confirmPassword);
    const query = await user.save();

    createSendToken(user, res, 201, 'User password is created successfully');

    // const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES_IN,
    // });

    // respond(res, 201, 'Password Updated', { query, token });
  } catch (err) {
    err.status = 400;
    return next(err);
  }
};
