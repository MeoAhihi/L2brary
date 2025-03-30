const express = require("express");
const router = express.Router();

const asyncHandler = require("express-async-handler");
const Session = require("../models/Session");

router.get(
  "/attendance",
  asyncHandler(async (req, res) => {
    const sessions = await Session.aggregate([
      {
        $group: {
          _id: "$class", // Group by the 'class' field
          sessions: { $push: "$$ROOT" }, // Push the entire session document into the group
        },
      },
    ]);

    res.json(sessions);
  })
);

module.exports = router;
