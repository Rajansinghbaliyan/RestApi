const User = require('../model/user');
const jwt = require('jsonwebtoken');

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

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: err.message,
    });
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

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      data: err.message,
    });
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
    res.status(401).json({
      status: 'fail token is not correct',
      data: err.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role))
        throw new Error('You are not authenticated for this');
      next();
    } catch (err) {
      res.status(403).json({
        status: 'fail',
        message: err.message,
      });
    }
  };
};
