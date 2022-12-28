const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: String,
    phone: String,
    role: String,
    mail: String,
    emailVerified: Boolean,
    avatar: String,
    courseID: [{ type: Schema.Types.ObjectId, ref: "courses" }],
    gem: {
      type: Number,
      default: 0,
    },
    birthday: Date,
    point: {
      type: Number,
      default: 0,
    },
    gender: String,
    isLock: Boolean, // Check xem tài khoản có đang khóa hay không
    transactions: [{ type: Schema.Types.ObjectId, ref: "transactions" }],
    attentions: [{ type: Schema.Types.ObjectId, ref: "attentions" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "notifications" }], //những thông báo người này tạo ra
  },
  { timestamps: true }
);

const User = mongoose.model("users", UserSchema);
module.exports = User;
