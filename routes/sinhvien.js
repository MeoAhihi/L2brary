const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("sinhvien", {
    sinhviens: [
      {
        fullName: "Nguyễn Văn A",
        birthday: "01/01/1999",
        gender: "Nam",
        group: "1",
        status: "Đang học",
      },
      {
        fullName: "Nguyễn Văn B",
        birthday: "02/02/1999",
        gender: "Nữ",
        group: "2",
        status: "Đang học",
      },
      {
        fullName: "Nguyễn Văn C",
        birthday: "03/03/1999",
        gender: "Nam",
        group: "1",
        status: "Đang học",
      },
    ],
  });
});

router.get("/create", (req, res) => {
  res.render("TaoSinhVien");
});

module.exports = router;
