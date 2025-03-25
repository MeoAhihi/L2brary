const mongoose = require("mongoose");
const SinhVien = require("./SinhVien");

const scoreSchema = new mongoose.Schema({
  sinhVien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SinhVien",
    required: true,
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Score = mongoose.model("Score", scoreSchema);

module.exports = Score;
