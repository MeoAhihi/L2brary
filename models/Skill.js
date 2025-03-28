const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  classGroup: {
    type: String,
    required: true,
  },
});

const Skill = mongoose.model("Skill", skillSchema);

module.exports = Skill;
