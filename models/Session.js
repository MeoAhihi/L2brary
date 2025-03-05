const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  classId: {
    type: Schema.Types.String,
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
    required: true,
  },
  endedAt: {
    type: Date,
  },
});

const Session = mongoose.model("Session", SessionSchema);

module.exports = Session;
