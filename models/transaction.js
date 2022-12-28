const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, ref: "users" },
    username: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    context: {
      transactionNumber: String,
      bankSend: String,
      bankReceive: String,
    },
    note: String,
  },
  { timestamps: true }
);

const Transaction = mongoose.model("transactions", TransactionSchema);
module.exports = Transaction;
