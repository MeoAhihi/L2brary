const express = require("express");
const SinhVien = require("../models/SinhVien");
const { toVietnameseRegex } = require("../utils/vietnamese");

const router = express.Router();

router.get("/qr", async (req, res) => {
  const { id } = req.query;
  const sinhVien = await SinhVien.findById(id);
  res.render("qr", { id: id, fullName: sinhVien.fullName });
});

router.get("/get-qr", async (req, res) => {
  const { fullName } = req.query;
  const sinhviens = await SinhVien.find({
    fullName: toVietnameseRegex(fullName),
  });

  res.render("sinhvien copy", {
    sinhviens: sinhviens.map((sv) => ({
      ...sv._doc,
      birthday: sv.birthday.toISOString().split("T")[0],
    })),
  });
});

router.get("/", async (req, res) => {
  const { fullName } = req.query;
  const sinhviens = await SinhVien.find({
    fullName: toVietnameseRegex(fullName),
  });

  res.render("sinhvien", {
    sinhviens: sinhviens.map((sv) => ({
      ...sv._doc,
      birthday: sv.birthday.toISOString().split("T")[0],
    })),
  });
});

router.get("/create", (req, res) => {
  res.render("taoSinhVien");
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

router.get("/edit/:id", async (req, res) => {
  const sinhVien = await SinhVien.findById(req.params.id);
  res.render("editSinhVien", {
    id: req.params.id,
    ...sinhVien._doc,
    birthday: formatDate(sinhVien.birthday),
  });
});

router.post("/create", async (req, res) => {
  const newSinhVien = new SinhVien(req.body);

  await newSinhVien.save();
  res.redirect("/sinhvien");
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { fullName, birthday, isMale, group, status } = req.body;
  const newSinhVien = await SinhVien.findByIdAndUpdate(
    id,
    {
      fullName,
      birthday: new Date(birthday),
      isMale,
      group,
      status,
    },
    {
      returnDocument: "after",
    }
  );
  console.log(req.body, newSinhVien);
  res.redirect("/sinhvien");
});

router.post("/delete/:id", async (req, res) => {
  await SinhVien.findByIdAndDelete(req.params.id);
  res.redirect("/sinhvien");
});

module.exports = router;
