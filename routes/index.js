const express = require("express");
const router = express.Router();
const ClassGroup = require("../models/ClassGroup");
/* GET home page. */
router.get("/", async function (req, res, next) {
  const classGroups = await ClassGroup.find();
  res.render("index", { title: "L2brary", classGroups });
});

module.exports = router;
