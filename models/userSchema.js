const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { type } = require('os');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter your name'],
  },
  email: {
    unique: true,
    type: String,
    required: [true, 'please neter your email'],
    lowerCase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
  },
  password: {
    type: String,
    required: [true, 'please enetr a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm the password'],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'passwordConfirm and password must be same',
    },
  },
  passwordchangedate: {
    type: Date,
    // default: Date.now(),
  },
  passwordToken: String,
  passwordExpiry: Date,
  active: { type: Boolean, select: false, default: true },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordchangedate = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  reqPassword,
  storedPassword,
) {
  // console.log(reqPassword, storedPassword);
  const correctstatus = bcrypt.compare(reqPassword, storedPassword);
  return correctstatus;
};

userSchema.methods.afterPasswordChange = async function (jwttimestamp) {
  if (this.passwordchangedate) {
    const changedtime = parseInt(this.passwordchangedate.getTime() / 1000, 10);
    // console.log(jwttimestamp, changedtime);
    return jwttimestamp < changedtime;
  }

  return false;
};

userSchema.methods.createPasswordtoken = function () {
  const usertoken = crypto.randomBytes(32).toString('hex');
  const encrypt = crypto.createHash('sha256').update(usertoken).digest('hex');
  this.passwordToken = encrypt;
  this.passwordExpiry = Date.now() + 10 * 60 * 1000;
  return usertoken;
};

userSchema.methods.resetpassword = function (password, passwordConfirm) {
  this.password = password;
  this.passwordConfirm = passwordConfirm;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
