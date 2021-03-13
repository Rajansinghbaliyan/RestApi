const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please fill your name'],
  },
  email: {
    type: String,
    required: [true, 'Please fill your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  role:{
    type: String,
    enum:['user','guide','lead-guide','admin'],
    default:'user'
  },
  password: {
    type: String,
    required: [true, 'Please fill your password'],
    select: false,
    minlength: 8,
    //validate: [validator.isStrongPassword, 'Please enter a Strong password'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please fill your password'],
    select: false,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Please enter the same confirm password',
    },
  },
  passwordUpdatedAt: {
    type: Date,
    Default: Date.now(),
  },
  passwordResetToken:{
    type: String
  },
  passwordResetTokenExpire:{
    type: Date
  }
});

//it will run on save or create
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); //return if the password is not modified

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.confirmPassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

userSchema.methods.passwordChanged = function(JWTCreated){
  //to change the time stamp of the passwordUpdatedAt

  const changedTimeStamp = parseInt(this.passwordUpdatedAt.getTime() / 1000);
  console.log(changedTimeStamp,JWTCreated);
  if(JWTCreated < changedTimeStamp) return true;
  return false;
}

userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');

  const resetTokenHash = crypto.createHash('sha256').digest(resetToken).toString('hex');

  console.log({resetToken},{resetTokenHash});

  this.passwordResetToken = resetTokenHash;

  this.passwordResetTokenExpire = Date.now() + 10 *60 *1000;

  return (resetToken);
}

const User = mongoose.model('User', userSchema);

module.exports = User;
