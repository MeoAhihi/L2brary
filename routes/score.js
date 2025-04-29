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
      {
        $unwind: "$sinhVien",
      },
    ]);

    const skills = await Skill.find({ classGroup: req.classGroup.name });
    res.render("readScore", {
      classGroup: req.classGroup,
      title: "Điểm số",
      headers: ["Họ và Tên", ...skills.map((skill) => skill.name)],
      values: sinhviens.map((sinhvien) => ({
        id: sinhvien._id,
        "Họ và Tên": sinhvien.sinhVien.fullName,
        ...sinhvien.scores.reduce((acc, cur) => {
          acc[cur.skill.name] = cur.score;
          return acc;
        }, {}),
      })),
      span: 0,
      createPage: `/${req.classGroup._id}/score/new`,
      updatePage: `/${req.classGroup._id}/score/edit`,
      deleteRoute: `/${req.classGroup._id}/score/delete`,
    });
  })
);

router.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const skills = await Skill.find({ classGroup: req.classGroup.name });
    res.render("create", {
      title: "Create Score",
      createPage: `/${req.classGroup._id}/class/new`,
      fields: [
        {
          label: "SinhVien",
          name: "sinhVien",
          type: "select",
          value: "#value-select",
          options: (await SinhVien.getSinhVienFullnameWithSortedLastName()).map(
            (sv) => ({
              value: sv._id,
              label: `[${sv.lastName}] ${sv.fullName}`,
            })
          ),
        },
        {
          label: "Skill",
          name: "skill",
          type: "select",
          value: "#value-select",
          options: skills.map((skill) => ({
            label: skill.name,
            value: skill._id,
          })),
        },
        {
          label: "Score",
          name: "score",
          type: "number",
        },
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
      sinhVien: req.body.sinhVien,
      skill: req.body.skill,
      score: req.body.score,
      createdAt: new Date(),
    });
    await newScore.save();
    res.redirect(`/${req.classGroup._id}/score`);
  })
);

router.post(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    await Score.findByIdAndUpdate(id, { score: req.body.Score });
    res.redirect(`/${req.classGroup._id}/score`);
  })
);

router.post(
  "/delete/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    await Score.findByIdAndDelete(id);
    res.redirect(`/${req.classGroup._id}/score`);
  })
);

module.exports = router;
