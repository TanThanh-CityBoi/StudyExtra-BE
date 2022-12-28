const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttentionSchema = new Schema(
  {
    username: String,
    examID: { type: Schema.Types.ObjectId, ref: "exam" },
    maxScore: Number,
    testRound: Number,
    result: [
      {
        score: Number,
        userAnswer: Array,
      },
    ],
    userID: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const Attention = mongoose.model("attention", AttentionSchema);
module.exports = Attention;
