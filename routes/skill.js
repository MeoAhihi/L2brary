const express = require("express");
const Skill = require("../models/Skill");
const { toVietnameseRegex } = require("../utils/vietnamese");

const router = express.Router();

router.get("/", async (req, res) => {
  const { skillName } = req.query;
  const skills = await Skill.find({ name: toVietnameseRegex(skillName) });

  res.render("skill", {
    skills,
  });
});

router.get("/new", (req, res) => {
  res.render("newSkill");
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const skillToEdit = await Skill.findById(id);
  res.render("editSkill", skillToEdit);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  const newSkill = new Skill({ name });
  await newSkill.save();

  res.redirect("/skill");
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await Skill.findByIdAndUpdate(id, { name });
  res.redirect("/skill");
});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await Skill.findByIdAndDelete(id);
  res.redirect("/skill");
});

module.exports = router;
