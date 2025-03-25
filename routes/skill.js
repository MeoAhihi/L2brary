const express = require("express");
const Skill = require("../models/Skill");
const { toVietnameseRegex } = require("../utils/vietnamese");
const expressAsyncHandler = require("express-async-handler");

const router = express.Router();

router.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { skillName } = req.query;
    const skills = await Skill.find({
      name: toVietnameseRegex(skillName),
      classGroup: req.classGroup.name,
    });

    res.render("read", {
      title: "Danh sách Kỹ năng",
      createPage: `/${req.classGroup._id}/skill/new`,
      updatePage: `/${req.classGroup._id}/skill/edit`,
      deleteRoute: `/${req.classGroup._id}/skill/delete`,
      isEditable: true,
      isDeleteable: true,
      isCreatable: false,
      span: 2,
      headers: ["Tên kỹ năng"],
      values: skills.map((skill) => ({
        id: skill._id,
        "Tên kỹ năng": skill.name,
      })),
    });
  })
);

router.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    res.render("create", {
      createRoute: `/${req.classGroup._id}/skill/new`,
      fields: [
        {
          label: "Tên",
          name: "name",
          type: "text",
        },
      ],
    });
  })
);

router.get(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const skillToEdit = await Skill.findById(id);
    res.render("update", {
      id: skillToEdit._id,
      updateRoute: `/${req.classGroup._id}/skill/edit/${id}`,
      title: "Chỉnh sửa Kỹ năng",
      fields: [
        {
          label: "Tên",
          name: "name",
          value: skillToEdit.name,
        },
      ],
    });
  })
);

router.post(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const { name } = req.body;
    const newSkill = new Skill({ name, classGroup: req.classGroup.name });
    await newSkill.save();

    res.redirect(`/${req.classGroup._id}/skill`);
  })
);

router.post(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    await Skill.findByIdAndUpdate(id, { name });
    res.redirect(`/${req.classGroup._id}/skill`);
  })
);

router.post(
  "/delete/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    await Skill.findByIdAndDelete(id);
    res.redirect(`/${req.classGroup._id}/skill`);
  })
);

module.exports = router;
