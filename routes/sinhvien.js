const express = require("express");
const SinhVien = require("../models/SinhVien");
const { toVietnameseRegex } = require("../utils/vietnamese");
const expressAsyncHandler = require("express-async-handler");
const ExcelJS = require("exceljs"); // Add this at the top of the file

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
    const sinhviens = await SinhVien.aggregate([
      {
        $match: {
          fullName: toVietnameseRegex(fullName),
        },
      },
      {
        $addFields: {
          lastName: { $arrayElemAt: [{ $split: ["$fullName", " "] }, -1] },
        },
      },
      {
        $sort: { group: 1, lastName: 1 },
      },
    ]);
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
        "Tổ",
        "Ngày sinh",
        "Giới tính",
        "SĐT",
        "Email",
        "Ngày TG",
        { name: "Mã QR", detailPage: "/sinhvien/qr?id=" },
      ],
      values: sinhviens.map((sv) => ({
        id: sv._id,
        "Họ và Tên": sv.fullName,
        "Ngày sinh": sv.birthday.toISOString().split("T")[0],
        "Giới tính": sv.isMale ? "Nam" : "Nữ",
        SĐT: sv.phoneNumber,
        Email: sv.email,
        "Ngày CĐ": sv.joinDate?.toISOString().split("T")[0],
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
          label: "SĐT",
          name: "phoneNumber",
          type: "text",
        },
        {
          label: "Email",
          name: "email",
          type: "text",
        },
        {
          label: "Ngày CĐ",
          name: "joinDate",
          type: "date",
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
  const year = date?.getFullYear();
  const month = ("0" + (date?.getMonth() + 1)).slice(-2);
  const day = ("0" + date?.getDate()).slice(-2);
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
          label: "SĐT",
          name: "phoneNumber",
          type: "text",
          value: sinhVien.phoneNumber,
        },
        {
          label: "Email",
          name: "email",
          type: "text",
          value: sinhVien.email,
        },
        {
          label: "Ngày CĐ",
          name: "joinDate",
          type: "date",
          value: formatDate(sinhVien.joinDate),
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
    const {
      fullName,
      birthday,
      isMale,
      phoneNumber,
      email,
      joinDate,
      group,
      status,
    } = req.body;
    const newSinhVien = await SinhVien.findByIdAndUpdate(
      id,
      {
        fullName,
        birthday: new Date(birthday),
        isMale,
        phoneNumber,
        email,
        joinDate: joinDate ? new Date(joinDate) : null,
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

router.get(
  "/export",
  expressAsyncHandler(async (req, res) => {
    const sinhviens = await SinhVien.find();

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sinh Viên");

    // Add headers
    worksheet.columns = [
      { header: "stt", key: "index", width: 10 },
      { header: "Mã hệ thống", key: "_id", width: 10 },
      { header: "Họ và Tên", key: "fullName", width: 30 },
      { header: "Ngày sinh", key: "birthday", width: 15 },
      { header: "C/K", key: "isMale", width: 10 },
      { header: "Tổ", key: "group", width: 10 },
    ];

    // Add rows
    sinhviens.forEach((sv, index) => {
      worksheet.addRow({
        index: index + 1,
        _id: sv._id,
        fullName: sv.fullName,
        birthday: sv.birthday,
        isMale: sv.isMale ? "Càn" : "Khôn",
        group: sv.group,
      });
    });

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SinhVienData.xlsx"
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  })
);

module.exports = router;
