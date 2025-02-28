const express = require("express");
const SinhVien = require("../models/SinhVien");
const Attendance = require("../models/Attendance");
const Class = require("../models/Class");

const router = express.Router();

// Get attendance list
router.get("/", async (req, res) => {
  const { classId } = req.query;
  const query = {};
  if (classId && classId.toLowerCase() !== "all") query.classId = classId;
  // if (date)

  const sinhviens = await SinhVien.find();
  const classes = await Class.find();
  const records = await Attendance.find(query, null, {
    sort: { joined_at: -1 },
  })
    .populate("sinhvienId")
    .populate("classId");
  console.log(records)
  res.render("attendance", {
    sinhviens,
    classes,
    records: records.map((record) => {
      return {
        id: record._id,
        name: record.sinhvienId?.fullName, // Assuming the SinhVien model has a fullName field
        date: record.joined_at.toISOString().split("T")[0],
        time: record.joined_at.toString().substr(16, 8),
        class: record.classId.name,
      };
    }),
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
    const { sinhvienIds, classId, submitTime } = req.body;

    // console.log(req.body);
    const data =
      sinhvienIds instanceof Array
        ? sinhvienIds.map((sinhvienId) => ({
            sinhvienId,
            classId,
            joined_at: submitTime,
          }))
        : [
            {
              sinhvienId: sinhvienIds,
              classId,
              joined_at: submitTime,
            },
          ];
    await Attendance.insertMany(data);

    // Add your attendance recording logic here
    res.redirect("/attendance");
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
