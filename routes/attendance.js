const express = require("express");
const SinhVien = require("../models/SinhVien");
const Attendance = require("../models/Attendance");
const Class = require("../models/Class");
const Session = require("../models/Session");

const router = express.Router();

// Get attendance list
router.get("/", async (req, res) => {
  const { classId } = req.query;
  const query = {};
  if (classId && classId.toLowerCase() !== "all") query.classId = classId;
  // if (date)

  const sinhviens = await SinhVien.find();
  const classes = await Class.find();

  const records = await Attendance.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "sinhviens",
        localField: "sinhvienId",
        foreignField: "_id",
        as: "sinhvienId",
      },
    },
    {
      $unwind: "$sinhvienId",
    },
    {
      $lookup: {
        from: "sessions",
        localField: "sessionId",
        foreignField: "_id",
        as: "sessionId",
      },
    },
    {
      $unwind: "$sessionId",
    },
    {
      $sort: { joined_at: -1 },
    },
  ]);

  // console.log(records);

  // const sesions = await Session.find()
  // console.log(sesions)
  res.render("attendance", {
    sinhviens,
    classes,
    records: records.map((record) => {
      return {
        id: record._id,
        name: record.sinhvienId?.fullName, // Assuming the SinhVien model has a fullName field
        date: record.joined_at.toISOString().split("T")[0],
        time: record.joined_at.toString().substr(16, 8),
        session: record.sessionId.title,
      };
    }),
  });
});

router.get("/confirm", async (req, res) => {
  const { sessionId, sinhvienId } = req.query;

  const sinhvien = await SinhVien.findById(sinhvienId);
  const session = await Session.findById(sessionId);
  const classInfo = await Class.findById(session.classId);
  res.render("confirm", {
    name: sinhvien.fullName,
    sessionId,
    className: classInfo.name,
    sinhvienId,
  });
});

router.get("/statistic", async (req, res) => {
  const { classId } = req.query;

  const attendedByDate = await Attendance.aggregate([
    {
      $match: { classId: classId },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$joined_at" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const classesJoinedBySinhVien = await Attendance.aggregate([
    {
      $match: {
        classId: "67909deca9085f0532d5b5ff",
      },
    },
    {
      $group: {
        _id: {
          sinhvienId: "$sinhvienId",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: "sinhviens",
        localField: "_id.sinhvienId",
        foreignField: "_id",
        as: "sinhvien",
      },
    },
    {
      $unwind: "$sinhvien",
    },
    {
      $project: {
        _id: 1,
        count: 1,
        sinhvienName: "$sinhvien.fullName",
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.json({ attendedByDate, classesJoinedBySinhVien });
});

// Record new attendance
router.post("/", async (req, res) => {
  try {
    const { sinhvienIds, sessionId, submitTime = new Date() } = req.body;

    const session = await Session.findById(sessionId);

    async function addToAttendance(id) {
      const sinhvien = await SinhVien.findById(id);

      session.attendance.push({
        sinhvienId: id,
        sinhvienName: sinhvien.fullName,
        joinTime: submitTime,
      });
    }
    console.log(sinhvienIds, sessionId, submitTime);
    if (sinhvienIds instanceof Array) {
      await Promise.all(sinhvienIds.forEach(addToAttendance));
    } else {
      await addToAttendance(sinhvienIds);
    }
    // Add attendance to the session
    await session.save();

    // Add your attendance recording logic here
    res.redirect("/session/" + sessionId);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance record
router.post("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Attendance.findByIdAndDelete(id);
    res.redirect("/attendance");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
