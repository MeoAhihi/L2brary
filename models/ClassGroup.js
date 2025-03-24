const mongoose = require("mongoose");

const classGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const ClassGroup = mongoose.model("ClassGroup", classGroupSchema);

module.exports = ClassGroup;
