const mongoose = require("mongoose");

const SinhVienSchema = new mongoose.Schema(
  {
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
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    joinDate: {
      type: Date,
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
  },
  {
    statics: {
      async getSinhVienFullnameWithSortedLastName() {
        return (await this.find({}, { fullName: 1 }))
          .map((sv) => ({
            lastName: sv.fullName.split(" ")[sv.fullName.split(" ").length - 1],
            fullName: sv.fullName,
            _id: sv._id,
          }))
          .sort((a, b) => a.lastName.localeCompare(b.lastName));
      },
    },
  }
);

const SinhVien = mongoose.model("SinhVien", SinhVienSchema);

module.exports = SinhVien;
