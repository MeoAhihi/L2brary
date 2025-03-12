const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const Session = require("../models/Session");

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const classes = await Session.aggregate([
      {
        $group: {
          _id: "$classId",
          sessions: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          _id: { $toObjectId: "$_id" },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classDetails",
        },
      },
    ]);

    // res.json(sessions);
    res.render("readMultiTable", {
      headers: ["Tiết học", "Ngày", "Bắt đầu", "Kết thúc"],
      pages: classes.map((cls) => ({
        title: `${cls.classDetails[0].name} ${cls.classDetails[0].day}(${cls.classDetails[0].startTime}-${cls.classDetails[0].endTime})`,
        values: cls.sessions.map((session) => ({
          "Tiết học": session.title,
          Ngày: session.startedAt.toISOString().substr(0, 10),
          "Bắt đầu": session.startedAt.toString().substr(16, 8),
          "Kết thúc": session.endedAt.toString().substr(16, 8),
        })),
      })),
    });
  })
);

module.exports = router;
