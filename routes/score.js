const express = require("express");
const Score = require("../models/Score");
const Skill = require("../models/Skill");
const SinhVien = require("../models/SinhVien");
const { toVietnameseRegex } = require("../utils/vietnamese");
const expressAsyncHandler = require("express-async-handler");

const router = express.Router();

router.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { scoreName } = req.query;
    const sinhviens = await Score.aggregate([
      {
        $group: {
          _id: {
            sinhvien: "$sinhVien",
            skill: "$skill",
          },
          score: {
            $sum: "$score",
          },
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "_id.skill",
          foreignField: "_id",
          as: "skillInfo",
        },
      },
      {
        $unwind: "$skillInfo",
      },
      {
        $match: {
          "skillInfo.classGroup": req.classGroup.name,
        },
      },
      {
        $group: {
          _id: "$_id.sinhvien",
          scores: {
            $push: {
              skill: "$skillInfo",
              score: "$score",
            },
          },
        },
      },
      {
        $lookup: {
          from: "sinhviens",
          localField: "_id",
          foreignField: "_id",
          as: "sinhVien",
        },
      },
    ]);
    res.render("readMultiTable", {
      title: "Điểm số",
      headers: ["Kỹ năng", "Điểm số"],
      pages: sinhviens.map((sinhvien) => ({
        span: 0,
        title: sinhvien.sinhVien[0].fullName,
        values: sinhvien.scores.map((score) => ({
          id: score._id,
          "Kỹ năng": score.skill.name,
          "Điểm số": score.score,
        })),
      })),
      createPage: `/${req.classGroup._id}/score/new`,
      updatePage: `/${req.classGroup._id}/score/edit`,
      deleteRoute: `/${req.classGroup._id}/score/delete`,
    });
  })
);

router.get(
  "/history",
  expressAsyncHandler(async (req, res) => {
    const { scoreName } = req.query;
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
    ]);
    res.render("read", {
      title: "Lịch sử điểm số",
      headers: ["Họ và Tên", "Kỹ năng", "Điểm số", "Thời điểm"],
      values: scores.map((score) => ({
        id: score._id,
        "Họ và Tên": score.sinhVien[0].fullName,
        "Kỹ năng": score.skillInfo[0]?.name,
        "Điểm số": score.score,
        "Thời điểm": score.createdAt,
      })),
      createPage: "/score/new",
      updatePage: "/score/edit",
      deleteRoute: "/score/delete",
    });
  })
);

function lastname(sv) {
  return sv.fullName.split(" ").at(-1);
}

router.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const sinhviens = await SinhVien.aggregate([
      {
        $addFields: {
          lastName: { $arrayElemAt: [{ $split: ["$fullName", " "] }, -1] },
        },
      },
      {
        $sort: {
          lastName: 1,
        },
      },
    ]);
    
    const skills = await Skill.find({ classGroup: req.classGroup.name });
    res.render("create", {
      title: "Create Score",
      createPage: `/${req.classGroup._id}/class/new`,
      fields: [
        {
          label: "SinhVien",
          type: "select",
          value: "#value-select",
          options: sinhviens.map((sv) => ({
            label: sv.fullName,
            value: sv._id,
          })),
        },
        {
          label: "Skill",
          type: "select",
          value: "#value-select",
          options: skills.map((skill) => ({
            label: skill.name,
            value: skill._id,
          })),
        },
        { label: "Score", type: "number" },
      ],
    });
  })
);

router.get(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const scoreToEdit = await Score.findById(id)
      .populate("sinhVien")
      .populate("skill");
    res.render("update", {
      id: scoreToEdit._id,
      title: "Update Score",
      fields: [
        {
          label: "SinhVien",
          type: "text",
          value: scoreToEdit.sinhVien.fullName,
        },
        {
          label: "Skill",
          type: "text",
          value: scoreToEdit.skill.name,
        },
        { label: "Score", type: "number", value: scoreToEdit.score },
      ],
      updateRoute: `/score/edit`,
    });
  })
);

router.post(
  "/new",
  expressAsyncHandler(async (req, res) => {
    console.log("🚀 ~ router.post ~ req:", req.body);

    const newScore = new Score({
      sinhVien: req.body.SinhVien,
      skill: req.body.Skill,
      score: req.body.Score,
      createdAt: new Date(),
    });
    await newScore.save();
    res.redirect("/score");
  })
);

router.post(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    await Score.findByIdAndUpdate(id, { score: req.body.Score });
    res.redirect("/score");
  })
);

router.post(
  "/delete/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    await Score.findByIdAndDelete(id);
    res.redirect("/score");
  })
);

module.exports = router;
