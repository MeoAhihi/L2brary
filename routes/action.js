const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const SinhVien = require("../models/SinhVien");
const { default: Action } = require("../models/Action");
const router = express.Router();

router.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    res.render("read", {
      title: "Lịch sử Hoạt động",
      deleteRoute: `/${req.classGroup._id}/action/delete`,
      updateRoute: `/${req.classGroup._id}/action/edit`,
      headers: ["Sinh viên", "Hành động", "Thời gian"],
      
    })
  })
);

router.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    res.render("create", {
      title: "Ghi nhận Hoạt động",
      createRoute: `/${req.classGroup._id}/action/new`,
      fields: [
        {
          label: "Sinh viên",
          name: "sinhVien",
          type: "select",
          options: (await SinhVien.getSinhVienFullnameWithSortedLastName()).map(
            (sv) => ({
              value: sv._id,
              label: `[${sv.lastName}] ${sv.fullName}`,
            })
          ),
        },
        {
          label: "Hành động",
          name: "action",
          type: "text",
        },
      ],
    });
  })
);

router.post(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const { sinhvien, action } = req.body;
    const sinhvienName = (await SinhVien.findById(sinhvien)).fullName;
    const newAction = await Action.create({
      sinhVien: sinhvien,
      sinhVienName: sinhvienName,
      action: action,
    });
  })
);

module.exports = router;
