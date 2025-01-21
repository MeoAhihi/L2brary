const mongoose = require("mongoose");

const SinhVienSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  isMale: {
    type: Boolean,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Đang học",
    required: false,
  },
});

const SinhVien = mongoose.model("SinhVien", SinhVienSchema);

module.exports = SinhVien;
