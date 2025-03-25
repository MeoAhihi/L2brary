const express = require("express");
const SinhVien = require("../models/SinhVien");
const { toVietnameseRegex } = require("../utils/vietnamese");
const expressAsyncHandler = require("express-async-handler");

const router = express.Router();

router.get(
  "/qr",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.query;
    const sinhVien = await SinhVien.findById(id);
    res.render("qr", { id: id, fullName: sinhVien.fullName });
  })
);

router.get(
  "/get-qr",
  expressAsyncHandler(async (req, res) => {
    const { fullName } = req.query;
    const sinhviens = await SinhVien.find({
      fullName: toVietnameseRegex(fullName),
    });

    res.render("read", {
      title: "Sinh viên",
      createPage: "#",
      updatePage: "#",
      deleteRoute: "#",
      isEditable: false,
      isDeleteable: false,
      isCreatable: false,
      span: 0,
      headers: ["Họ và Tên", { name: "Mã QR", detailPage: "/sinhvien/qr?id=" }],
      values: sinhviens.map((sv) => ({
        id: sv._id,
        "Họ và Tên": sv.fullName,
        // "Ngày sinh": sv.birthday.toISOString().split("T")[0],
        // "Giới tính": sv.gender,
        // Tổ: sv.group,
        "Mã QR": "Xem",
      })),
    });
  })
);

router.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { fullName } = req.query;
    const sinhviens = await SinhVien.find(
      {
        fullName: toVietnameseRegex(fullName),
      },
      null,
      { sort: { group: 1, fullName: 1 } }
    );
    res.render("read", {
      title: "Sinh viên",
      createPage: `/sinhvien/new`,
      updatePage: `/sinhvien/edit`,
      deleteRoute: `/sinhvien/delete`,
      isEditable: true,
      isDeleteable: true,
      isCreatable: false,
      span: 2,
      headers: [
        "Họ và Tên",
        "Ngày sinh",
        "Giới tính",
        "Tổ",
        { name: "Mã QR", detailPage: "/sinhvien/qr?id=" },
      ],
      values: sinhviens.map((sv) => ({
        id: sv._id,
        "Họ và Tên": sv.fullName,
        "Ngày sinh": sv.birthday.toISOString().split("T")[0],
        "Giới tính": sv.isMale ? "Nam" : "Nữ",
        Tổ: sv.group,
        "Mã QR": "Xem",
      })),
    });
  })
);

router.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    res.render("create", {
      createRoute: `/sinhvien/new`,
      fields: [
        {
          label: "Họ và Tên",
          name: "fullName",
          type: "text",
        },
        {
          label: "ngày sinh",
          name: "birthday",
          type: "date",
        },
        {
          label: "Giới tính",
          name: "isMale",
          type: "radios",
          options: [
            {
              label: "Nam",
              value: "true",
            },
            {
              label: "Nữ",
              value: "false",
            },
          ],
        },
        {
          label: "Tổ",
          name: "group",
          type: "select",
          options: [
            {
              label: "1",
              value: "1",
            },
            {
              label: "2",
              value: "2",
            },
            {
              label: "Phụ trách",
              value: "Phụ trách",
            },
            {
              label: "Chưa phân tổ",
              value: "Chưa phân tổ",
            },
          ],
        },
      ],
    });
  })
);

function formatDate(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

router.get(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const sinhVien = await SinhVien.findById(req.params.id);

    res.render("update", {
      id: sinhVien._id,
      updateRoute: `/sinhvien/edit/${sinhVien._id}`,
      title: "Chỉnh sửa sinh viên",
      fields: [
        {
          label: "Họ và Tên",
          name: "fullName",
          type: "text",
          value: sinhVien.fullName,
        },
        {
          label: "ngày sinh",
          name: "birthday",
          type: "date",
          value: formatDate(sinhVien.birthday),
        },
        {
          label: "Giới tính",
          name: "isMale",
          type: "radios",
          options: [
            {
              label: "Nam",
              value: "true",
            },
            {
              label: "Nữ",
              value: "false",
            },
          ],
          value: sinhVien.isMale ? "true" : "false",
        },
        {
          label: "Tổ",
          name: "group",
          type: "select",
          options: [
            {
              label: "1",
              value: "1",
            },
            {
              label: "2",
              value: "2",
            },
            {
              label: "Phụ trách",
              value: "Phụ trách",
            },
            {
              label: "Chưa phân tổ",
              value: "Chưa phân tổ",
            },
          ],
          value: sinhVien.group,
        },
      ],
    });
  })
);

router.post(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const newSinhVien = new SinhVien(req.body);

    await newSinhVien.save();
    res.redirect("/sinhvien");
  })
);

router.post(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
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
    res.redirect("/sinhvien");
  })
);

router.post(
  "/delete/:id",
  expressAsyncHandler(async (req, res) => {
    await SinhVien.findByIdAndDelete(req.params.id);
    res.redirect("/sinhvien");
  })
);

module.exports = router;
