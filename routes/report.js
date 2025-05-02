const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");

const Score = require("../models/Score");
const Attendance = require("../models/Attendance");

router.get(
  "/score/history",
  expressAsyncHandler(async (req, res) => {
    const scores = await Score.aggregate([
      {
        $lookup: {
          from: "sinhviens",
          localField: "sinhVien",
          foreignField: "_id",
          as: "sinhVien",
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "skill",
          foreignField: "_id",
          as: "skillInfo",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    res.render("read", {
      title: "Lịch sử điểm số",
      headers: ["Họ và Tên", "Kỹ năng", "Điểm số", "Thời điểm"],
      values: scores.map((score) => ({
        id: score._id,
        "Họ và Tên": score.sinhVien[0].fullName,
        "Kỹ năng": score.skillInfo[0]?.name,
        "Điểm số": score.score,
        "Thời điểm": score.createdAt.toLocaleString(),
      })),
      span:0,
      createPage: "/score/new",
      updatePage: "/score/edit",
      deleteRoute: "/score/delete",
    });
  })
);

router.get("/attendance/statistic", async (req, res) => {
  const { classId } = req.query;

  const attendedByDate = await Attendance.aggregate([
    {
      $match: { classId: classId },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$joined_at" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const classesJoinedBySinhVien = await Attendance.aggregate([
    {
      $match: {
        classId: "67909deca9085f0532d5b5ff",
      },
    },
    {
      $group: {
        _id: {
          sinhvienId: "$sinhvienId",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: "sinhviens",
        localField: "_id.sinhvienId",
        foreignField: "_id",
        as: "sinhvien",
      },
    },
    {
      $unwind: "$sinhvien",
    },
    {
      $project: {
        _id: 1,
        count: 1,
        sinhvienName: "$sinhvien.fullName",
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.json({ attendedByDate, classesJoinedBySinhVien });
});

module.exports = router;
