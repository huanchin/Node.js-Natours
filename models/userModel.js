const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'], // built-in validator
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'], // built-in validator
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: [8, 'A  password must have at least 8 characters'],
    select: false,
  },
  passwordChangedAt: Date,
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: [8, 'A  password must have at least 8 characters'],
    validate: {
      validator: function (val) {
        // custom validator
        // this only points to current doc on NEW document creation (not for update)
        // this only use on CREATE and SAVE!!!

        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

/***** 每一次更新密碼 *****/
userSchema.pre('save', async function (next) {
  // only run this function if password is actually modified
  // 沒有更新則跳至下一個 middleware
  if (!this.isModified('password')) return next();

  // 如果有 modified password...
  // 把登入時候使用者傳進來的 password 加密後存於 password property
  // bcrypt: hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});
// 每次更新密碼後會跑，假設有更新密碼，則帶入現在時候
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChangedAt = Date.now();
//   next();
// });

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword,
) {
  const correct = bcrypt.compareSync(candidatePassword, userPassword);
  return correct;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // 使用 crypto 生產出一個 token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // 將此 token 加密後存於 DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 設定此 token 過期時間：10分鐘 * 60秒 * 1000毫秒/ 秒
  // 請留意：此行程式碼只代表 modified passwordResetExpires property，但尚未儲存！
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min

  console.log({ resetToken }, this.passwordResetToken);
  // 回傳未加密的 raw token
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
