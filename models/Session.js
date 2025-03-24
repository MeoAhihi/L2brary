const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  title: {
    type: Schema.Types.String,
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  attendance: [
    {
      sinhvienId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sinhvien",
        required: true,
      },
      sinhvienName: {
        type: Schema.Types.String,
        required: true,
      },
      joinTime: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
});

const Session = mongoose.model("Session", SessionSchema);

module.exports = Session;
