const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  sinhVien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SinhVien",
    required: true,
  },
  sinhVienName: {
    type: String,
  },
  action: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // This makes the field immutable
  },
});

const Action = mongoose.model("Action", actionSchema);

module.exports = Action;
