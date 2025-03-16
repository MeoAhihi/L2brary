const express = require("express");
const Score = require("../models/Score");
const Skill = require("../models/Skill");
const SinhVien = require("../models/SinhVien");
const { toVietnameseRegex } = require("../utils/vietnamese");

const router = express.Router();

router.get("/", async (req, res) => {
  const { scoreName } = req.query;
  const scores = await Score.aggregate([
    {
      $lookup: {
        from: "sinhviens",
        localField: "sinhVien",
        foreignField: "_id",
        as: "sinhVien"
      }
    },
    {
      $lookup: {
        from: "skills",
        localField: "skill",
        foreignField: "_id",
        as: "skill"
      }
    },
  ]);
    // .populate("sinhVien")
    // .populate("skill");
  console.log(scores);
  res.render("read", {
    title: "Score",
    headers: ["SinhVien", "Skill", "Score", "Created At"],
    values: scores.map((score) => ({
      id: score._id,
      SinhVien: score.sinhVien.fullName,
      Skill: score.skill.name,
      Score: score.score,
      "Created At": score.createdAt,
    })),
    createPage: "/score/new",
    updatePage: "/score/edit",
    deleteRoute: "/score/delete",
  });
});

router.get("/new", async (req, res) => {
  const sinhviens = await SinhVien.find();
  const skills = await Skill.find();
  res.render("create", {
    title: "Create Score",
    fields: [
      {
        label: "SinhVien",
        type: "select",
        value: "#value-select",
        options: sinhviens.map((sv) => ({ label: sv.fullName, value: sv._id })),
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
    createRoute: "/score",
  });
});

router.get("/edit/:id", async (req, res) => {
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
});

router.post("/", async (req, res) => {
  const newScore = new Score({
    sinhVien: req.body.SinhVien,
    skill: req.body.Skill,
    score: req.body.Score,
    createdAt: new Date(),
  });
  await newScore.save();
  res.redirect("/score");
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  await Score.findByIdAndUpdate(id, { score: req.body.Score });
  res.redirect("/score");
});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await Score.findByIdAndDelete(id);
  res.redirect("/score");
});

module.exports = router;
