const express = require("express");
const Class = require("../models/Class");
const { toVietnameseRegex } = require("../utils/vietnamese");

const router = express.Router();

router.get("/", async (req, res) => {
  const { className } = req.query;
  const classes = await Class.find({ name: toVietnameseRegex(className) });

  res.render("class", {
    classes,
  });
});

router.get("/new", (req, res) => {
  res.render("newClass");
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const classToEdit = await Class.findById(id);
  res.render("editClass", classToEdit);
});

router.post("/", async (req, res) => {
  const { name, day, startTime, endTime } = req.body;
  const newClass = new Class({ name, day, startTime, endTime });
  await newClass.save();

  res.redirect("/class");
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name, day, startTime, endTime } = req.body;
  await Class.findByIdAndUpdate(id, { name, day, startTime, endTime });
  res.redirect("/class");
});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.body;
  await Class.findByIdAndDelete(id);
  res.redirect("/class");
});

module.exports = router;
