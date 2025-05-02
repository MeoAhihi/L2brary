const express = require("express");
const mongoose = require("mongoose");
const Class = require("../models/Class");
const Session = require("../models/Session");
const { toVietnameseRegex } = require("../utils/vietnamese");
const expressAsyncHandler = require("express-async-handler");

const router = express.Router();

router.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { className } = req.query;
    const classes = await Class.find({
      name: toVietnameseRegex(className),
      classGroup: req.classGroup.name,
    });
    res.render("read", {
      title: "Danh sách lớp học",
      headers: [
        { name: "Tên Lớp", detailPage: `/${req.classGroup._id}/class/` },
        "Ngày học",
        "Giờ Bắt Đầu",
        "Giờ Kết Thúc",
      ],
      createPage: `/${req.classGroup._id}/class/new`,
      updatePage: `/${req.classGroup._id}/class/edit`,
      deleteRoute: `/${req.classGroup._id}/class/delete`,
      isEditable: true,
      isDeleteable: true,
      isCreatable: false,
      span: 2,
      values: classes.map((cls) => ({
        id: cls._id,
        "Tên Lớp": cls.name,
        "Ngày học": cls.day,
        "Giờ Bắt Đầu": cls.startTime,
        "Giờ Kết Thúc": cls.endTime,
      })),
    });
  })
);

router.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    res.render("create", {
      createRoute: `/${req.classGroup._id}/class/new`,
      fields: [
        {
          label: "Tên Lớp",
          name: "name",
          type: "text",
        },
        {
          label: "Ngày học",
          name: "day",
          type: "select",
          options: [
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
            "Chủ Nhật",
          ].map((day) => ({ value: day, label: day })),
        },
        {
          label: "Giờ Bắt Đầu",
          name: "startTime",
          type: "time",
        },
        {
          label: "Giờ Kết Thúc",
          name: "endTime",
          type: "time",
        },
      ],
    });
  })
);

router.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const [cls, sessions, attendance] = await Promise.all([
      Class.findById(id),
      Session.find({ classId: new mongoose.Types.ObjectId(id) }),
      Session.aggregate([
        { $match: { classId: new mongoose.Types.ObjectId(id) } },
        {
          $project: {
            _id: 1,
            date: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
            attendance: 1,
          },
        },
        { $unwind: "$attendance" },
        {
          $group: {
            _id: {
              sinhvienId: "$attendance.sinhvienId",
              sinhvienName: "$attendance.sinhvienName",
            },
            presented: { $sum: 1 },
            attendedSession: { $push: "$_id" },
          },
        },
      ]),
    ]);

    // res.json({
    //   class: cls,
    //   sessions: sessions?.map((session) => ({
    //     id: session._id,
    //     title: session.title,
    //     date: session.startedAt.toISOString().split("T")[0],
    //     count: session.attendance?.length,
    //   })),
    //   attendance,
    // });

    const dates = sessions
      .sort((a, b) => a.startedAt - b.startedAt)
      .map((session) => ({
        id: session._id.toString(),
        date: session.startedAt.toISOString().split("T")[0],
      }));
    res.render("read", {
      title: `${cls.name} ${cls.day}(${cls.startTime} - ${cls.endTime})`,
      isCreatable: false,
      isEditable: false,
      isDeleteable: false,
      span: 0,
      headers: [
        "Sinh viên",
        "Đi học",
        "Vắng",
        "%",
        ...dates.map((d) => d.date || []),
      ],
      values: attendance.map((att) => ({
        "Sinh viên": att._id.sinhvienName,
        "Đi học": att.presented,
        Vắng: dates.length - att.presented,
        "%": Math.floor((att.presented / dates.length) * 100) + "%",
        ...dates
          .map((d) => ({
            date: d.date,
            present: att.attendedSession.toString().includes(d.id) ? "v" : "-",
          }))
          .reduce((acc, { date, present }) => {
            acc[date] = present;
            return acc;
          }, {}),
      })),
      deleteRoute: `/${req.classGroup._id}/class/${id}`,
    });
  })
);

router.get(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const classToEdit = await Class.findById(id);
    res.render("update", {
      id: classToEdit._id,
      updateRoute: `/${req.classGroup._id}/session/${id}`,
      title: "Chỉnh sửa lớp học",
      fields: [
        {
          label: "Tên Lớp",
          name: "name",
          type: "text",
          value: classToEdit.name,
        },
        {
          label: "Ngày học",
          name: "day",
          value: classToEdit.day,
          type: "select",
          options: [
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
            "Chủ Nhật",
          ].map((day) => ({ value: day, label: day })),
        },
        {
          label: "Giờ Bắt Đầu",
          name: "startTime",
          type: "time",
          value: classToEdit.startTime,
        },
        {
          label: "Giờ Kết Thúc",
          name: "endTime",
          type: "time",
          value: classToEdit.endTime,
        },
      ],
    });
  })
);

router.post(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const { name, day, startTime, endTime } = req.body;
    const newClass = new Class({
      name,
      day,
      startTime,
      endTime,
      classGroup: req.classGroup.name,
    });
    await newClass.save();

    res.redirect(".");
  })
);

router.post(
  "/edit/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, day, startTime, endTime } = req.body;
    await Class.findByIdAndUpdate(id, {
      name,
      day,
      startTime,
      endTime,
    });
    res.redirect("..");
  })
);

router.post(
  "/delete/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    await Class.findByIdAndDelete(id);
    res.redirect("..");
  })
);

module.exports = router;
