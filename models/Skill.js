const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    classGroup: {
      type: String,
      required: true,
    },
  },
  {
    statics: {
      async getCategories(classGroup) {
        const categories = await this.aggregate([
          {
            $match: {
              classGroup,
            },
          },
          {
            $group: {
              _id: "$category",
            },
          },
          {
            $match: {
              _id: { $ne: null },
            },
          },
        ]);
        const uniqueCategories = [...new Set(categories)].map((category) => category._id);
        return uniqueCategories;
      },
    },
  }
);

const Skill = mongoose.model("Skill", skillSchema);

module.exports = Skill;
