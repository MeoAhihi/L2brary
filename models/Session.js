const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  classId: {
    type: Schema.Types.String,
    ref: "Class",
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endedAt: {
    type: Date,
  },
});

const Attendance = mongoose.model("Attendance", AttendanceSchema);

module.exports = Attendance;
