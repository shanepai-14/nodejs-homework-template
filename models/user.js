const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  avatarURL: String,
  token: {
    type: String,
    default: null,
  },
});

userSchema.pre('save', function (next) {
  if (this.isNew) {
    this.avatarURL = gravatar.url(this.email, { s: '250', r: 'x', d: 'retro' }, true);
  }
  next();
});


const User = mongoose.model('user', userSchema);

module.exports = User;