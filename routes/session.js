const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const Session = require("../models/Session");
const Class = require("../models/Class");

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

    // res.json(sessions);
    res.render("readMultiTable", {
      title: "Danh sách tiết học",
      createPage: "/session/new",
      updatePage: "/session/edit",
      deleteRoute: "/session/delete",
      headers: ["Tiết học", "Ngày", "Bắt đầu", "Kết thúc"],
      pages: classes.map((cls) => ({
        isEditable: true,
        isDeleteable: true,
        isCreatable: false,
        span: 3,
        title: `${cls.classDetails[0].name} ${cls.classDetails[0].day}(${cls.classDetails[0].startTime}-${cls.classDetails[0].endTime})`,
        values: cls.sessions.map((session) => ({
          id: session._id,
          "Tiết học": session.title,
          Ngày: session.startedAt.toISOString().substr(0, 10),
          "Bắt đầu": session.startedAt.toString().substr(16, 8),
          "Kết thúc": session.endedAt
            ? session.endedAt.toString().substr(16, 8)
            : "Chưa kết thúc",
        })),
      })),
    });
  })
);

router.get(
  "/new",
  asyncHandler(async (req, res, next) => {
    const classes = await Class.find();
    res.render("create", {
      createRoute: "/session",
      fields: [
        {
          label: "Lớp học",
          type: "select",
          options: classes.map((cls) => ({ value: cls._id, label: cls.name })),
        },
        {
          label: "Tiêu đề",
          type: "text",
          placeholder: "Tiết học",
        },
        {
          label: "Thời gian bắt đầu",
          type: "datetime-local",
          placeholder: "Bắt đầu",
        },
      ],
    });
  })
);

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const sessionToEdit = await Session.findById(id);
  res.render("update", {
    id: sessionToEdit._id,
    title: "Chỉnh sửa tiết học",
    fields: [
      {
        label: "Lớp học",
        type: "text",
        value: sessionToEdit.classId,
      },
      {
        label: "Tiêu đề",
        type: "text",
        value: sessionToEdit.title,
      },
      {
        label: "Thời gian bắt đầu",
        type: "datetime-local",
        value: sessionToEdit.startedAt.toISOString().substr(0, 16),
      },
      {
        label: "Thời gian kết thúc",
        type: "datetime-local",
        value: sessionToEdit.endedAt
          ? sessionToEdit.endedAt.toISOString().substr(0, 16)
          : "Chưa kết thúc",
      },
    ],
    updateRoute: "/session",
  });
});

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    const classId = req.body["Lớp học"];
    const title = req.body["Tiêu đề"];
    const startedAt = new Date(req.body["Thời gian bắt đầu"]);
    await Session.create({ classId, title, startedAt });
    res.redirect("/session");
  })
);

router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const classId = req.body["Lớp học"];
  const title = req.body["Tiêu đề"];
  const startedAt = new Date(req.body["Thời gian bắt đầu"]);
  const endedAt = req.body["Thời gian kết thúc"]
    ? new Date(req.body["Thời gian kết thúc"])
    : null;

  await Session.findByIdAndUpdate(id, { classId, title, startedAt, endedAt });
  res.redirect("/session");
});

router.post(
  "/delete/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Session.findByIdAndDelete(id);
    res.redirect("/session");
  })
);

module.exports = router;
