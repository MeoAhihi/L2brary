const express = require("express");
const router = express.Router();

const SinhVien = require("../models/SinhVien");

/* GET users listing. */
router.get("/:id", async function (req, res, next) {
  const sinhvien = await SinhVien.findById(req.params.id);
  res.json(sinhvien);
});

module.exports = router;
