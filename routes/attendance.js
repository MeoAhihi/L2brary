const express = require("express");
const SinhVien = require("../models/SinhVien");
const Attendance = require("../models/Attendance");

const router = express.Router();

// Get attendance list
router.get("/", async (req, res) => {
  const { classId } = req.query;
  const query = {};
  if (classId?.toLowerCase() !== "all") query.classId = classId;
  // if (date)

  const sinhviens = await SinhVien.find();
  const records = await Attendance.find(query).populate("sinhvienId");
  console.log(records);

  res.render("attendance", {
    sinhviens,
    records: records.map((record) => {
      return {
        id: record._id,
        name: record.sinhvienId.fullName, // Assuming the SinhVien model has a fullName field
        date: record.joined_at.toISOString().split("T")[0],
        time: record.joined_at.toString().substr(16, 8),
        class: record.classId,
      };
    }),
  });
});

// Record new attendance
router.post("/", async (req, res) => {
  try {
    const { sinhvienIds, classId, submitTime } = req.body;
    const data = sinhvienIds.map((sinhvienId) => ({
      sinhvienId,
      classId,
      joined_at: submitTime,
    }));
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
