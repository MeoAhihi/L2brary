const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  sinhvienId: {
    type: Schema.Types.ObjectId,
    ref: "SinhVien",
    required: true,
  },
  sessionId: {
    type: Schema.Types.String,
    ref: "Session",
    required: true,
  },
  joined_at: {
    type: Date,
    default: Date.now,
  },
});

const Attendance = mongoose.model("Attendance", AttendanceSchema);

module.exports = Attendance;
