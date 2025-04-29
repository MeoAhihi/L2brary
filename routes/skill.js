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
      headers: ["Phân loại", "Tên kỹ năng"],
      values: skills.map((skill) => ({
        id: skill._id,
        "Phân loại": skill.category,
        "Tên kỹ năng": skill.name,
      })),
    });
  })
);

router.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const categories = await Skill.getCategories(req.classGroup.name);
    res.render("create", {
      createRoute: `/${req.classGroup._id}/skill/new`,
      fields: [
        {
          label: "Phân loại",
          name: "category",
          type: "select",
          options: [
            { label: "-Trống-", value: "####0000" },
            ...categories.map((category) => ({
              label: category,
              value: category,
            })),
            { label: "Khác", value: "other" },
          ],
        },
        {
          label: "Phân loại khác",
          name: "categoryOther",
          type: "text",
        },
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
          label: "Phân loại",
          name: "category",
          type: "select",
          options: [
            { label: "-Trống-", value: null },
            ...(await Skill.getCategories(req.classGroup.name)).map(
              (category) => ({
                label: category,
                value: category,
              })
            ),
            { label: "Khác", value: "other" },
          ],
        },
        {
          label: "Phân loại khác",
          name: "categoryOther",
          type: "text",
        },
        {
          label: "Tên",
          name: "name",
          type: "text",
          value: skillToEdit.name,
        },
      ],
    });
  })
);

router.post(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const { category, categoryOther, name } = req.body;
    let newSkill;
    if (category === "####0000") {
      newSkill = new Skill({ name, classGroup: req.classGroup.name });
    } else if (category === "other") {
      newSkill = new Skill({
        name,
        classGroup: req.classGroup.name,
        category: categoryOther,
      });
    } else {
      newSkill = new Skill({
        name,
        classGroup: req.classGroup.name,
        category,
      });
    }
    await newSkill.save();

    res.redirect(`/${req.classGroup._id}/skill`);
  })
);

router.post(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { category, categoryOther, name } = req.body;
    if (category === "####0000") {
      await Skill.findByIdAndUpdate(id, {
        name,
        category: null,
      });
    } else if (category === "other") {
      await Skill.findByIdAndUpdate(id, {
        name,
        category: categoryOther,
      });
    } else {
      await Skill.findByIdAndUpdate(id, {
        name,
        category,
      });
    }

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
