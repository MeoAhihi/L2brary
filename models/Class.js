const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SinhVien",
      studentName: {
        type: String,
      },
      group: {
        type: String,
      },
      position: {
        type: String,
      },
    },
  ],
  classGroup: {
    type: String,
    required: true,
  },
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
