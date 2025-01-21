const express = require("express");
const SinhVien = require("../models/SinhVien");

const router = express.Router();

router.get("/", async (req, res) => {
  const sinhviens = await SinhVien.find();
  res.render("sinhvien", {
    sinhviens: sinhviens.map((sv) => ({
      ...sv._doc,
      birthday: sv.birthday.toISOString().split("T")[0],
    })),
  });
});

router.get("/create", (req, res) => {
  res.render("TaoSinhVien");
});

router.get("/edit/:id", async (req, res) => {
  const sinhVien = await SinhVien.findById(req.params.id);

  res.render("editSinhVien", {
    ...sinhVien._doc,
    birthday: sinhVien.birthday.toISOString().split("T")[0],
  });
});

router.post("/create", async (req, res) => {
  const newSinhVien = new SinhVien(req.body);
  await newSinhVien.save();
  res.redirect("/sinhvien");
});

router.post("/delete/:id", async (req, res) => {
  await SinhVien.findByIdAndDelete(req.params.id);
  res.redirect("/sinhvien");
});

module.exports = router;
