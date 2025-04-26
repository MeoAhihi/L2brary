const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { toVietnameseRegex } = require("../utils/vietnamese");

const Session = require("../models/Session");
const Class = require("../models/Class");
const SinhVien = require("../models/SinhVien");

router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const classes = await Session.aggregate([
      {
        $group: {
          _id: "$classId",
          sessions: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          _id: { $toObjectId: "$_id" },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classDetails",
        },
      },
    ]);

    res.json(classes);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const classes = await Session.aggregate([
      {
        $group: {
          _id: "$classId",
          sessions: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          _id: { $toObjectId: "$_id" },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classDetails",
        },
      },
    ]);

    const filter = classes.filter(
      (cls) => cls.classDetails[0].classGroup === req.classGroup.name
    );
    const now = new Date();

    const sessionsInClasses = filter.map((cls) => ({
      isEditable: true,
      isDeleteable: true,
      isCreatable: false,
      span: 3,
      title: `${cls.classDetails[0].name} ${cls.classDetails[0].day} (${cls.classDetails[0].startTime}-${cls.classDetails[0].endTime})`,
      values: cls.sessions
        .sort((a, b) => b.startedAt - a.startedAt)
        .map((session) => ({
          id: session._id,
          "Tiết học": session.title,
          Ngày: session.startedAt.toISOString().substr(0, 10),
          "Bắt đầu": session.startedAt.toString().substr(16, 8),
          "Kết thúc": session.endedAt
            ? session.endedAt.toString().substr(16, 8)
            : "Chưa kết thúc",
        })),
    }));
    // res.json(sessions);
    res.render("readMultiTable", {
      title: "Danh sách tiết học",
      createPage: `/${req.classGroup._id}/session/new`,
      updatePage: `/${req.classGroup._id}/session/edit`,
      deleteRoute: `/${req.classGroup._id}/session/delete`,
      headers: [
        { name: "Tiết học", detailPage: `/${req.classGroup._id}/session/` },
        "Ngày",
        "Bắt đầu",
        "Kết thúc",
      ],
      pages: sessionsInClasses,
    });
  })
);

router.get(
  "/new",
  asyncHandler(async (req, res, next) => {
    const classes = await Class.find({ classGroup: req.classGroup.name });
    res.render("create", {
      createRoute: `/${req.classGroup._id}/session/new`,
      fields: [
        {
          label: "Lớp học",
          name: "classId",
          type: "select",
          options: classes.map((cls) => ({ value: cls._id, label: cls.name })),
        },
        {
          label: "Tiêu đề",
          name: "title",
          type: "text",
          placeholder: "Tiết học",
        },
        {
          label: "Thời gian bắt đầu",
          name: "startAt",
          type: "datetime-local",
          placeholder: "Bắt đầu",
        },
      ],
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const session = await Session.findById(id).populate("classId");
    const sinhviens = await SinhVien.aggregate([
      {
        $addFields: {
          lastName: { $arrayElemAt: [{ $split: ["$fullName", " "] }, -1] },
        },
      },
      {
        $sort: { lastName: 1 },
      },
    ]);

    res.render("sessionAttendance", {
      sinhviens,
      isDeleteable: false,
      span: 0,
      title: `${session.title} (${session.classId.name})`,
      id: session._id,
      headers: ["Họ và Tên", "Thời gian tham gia"],
      values: session.attendance.map((sinhvien) => ({
        "Họ và Tên": sinhvien.sinhvienName,
        "Thời gian tham gia": sinhvien.joinTime.toString().substr(16, 8),
      })),
      deleteRoute: `/${req.classGroup._id}/session/delete`,
    });
  })
);

router.get(
  "/edit/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sessionToEdit = await Session.findById(id);
    
    res.render("update", {
      id: sessionToEdit._id,
      updateRoute: `/${req.classGroup._id}/session/edit/${id}`,
      title: "Chỉnh sửa tiết học",
      fields: [
        {
          label: "Tiêu đề",
          name: "title",
          type: "text",
          value: sessionToEdit.title,
        },
        {
          label: "Thời gian bắt đầu",
          name: "startedAt",
          type: "datetime-local",
          value: new Date(
            sessionToEdit.startedAt.getTime() -
              sessionToEdit.startedAt.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16),
        },
        {
          label: "Thời gian kết thúc",
          name: "endedAt",
          type: "datetime-local",
          value: sessionToEdit.endedAt
            ? new Date(
                sessionToEdit.endedAt.getTime() -
                  sessionToEdit.endedAt.getTimezoneOffset() * 60000
              )
                .toISOString()
                .slice(0, 16)
            : "Chưa kết thúc",
        },
      ],
    });
  })
);

router.post(
  "/new",
  asyncHandler(async (req, res, next) => {
    const { classId, title, startAt } = req.body;
    await Session.create({ classId, title, startedAt: new Date(startAt) });
    res.redirect(`/${req.classGroup._id}/session`);
  })
);

router.post(
  "/edit/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, startedAt, endedAt } = req.body;
    const data = {
      title,
      startedAt: new Date(startedAt),
      endedAt: endedAt ? new Date(endedAt) : null,
    };
    await Session.findByIdAndUpdate(id, data);
    res.redirect(`/${req.classGroup._id}/session`);
  })
);

router.post(
  "/delete/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Session.findByIdAndDelete(id);
    res.redirect(`/${req.classGroup._id}/session`);
  })
);

module.exports = router;
