const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
require("./db");
const expressAsyncHandler = require("express-async-handler");
const ClassGroup = require("./models/ClassGroup");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const sinhvienRouter = require("./routes/sinhvien");
const exportRouter = require("./routes/export");
const attendanceRouter = require("./routes/attendance");
const classRouter = require("./routes/class");
const skillRouter = require("./routes/skill");
const scoreRouter = require("./routes/score");
const sessionRouter = require("./routes/session");
const actionRouter = require("./routes/action");
const reportRouter = require("./routes/report");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const classGroupMiddleware = expressAsyncHandler(async (req, res, next) => {
  const { classGroupId } = req.params;
  const classGroup = await ClassGroup.findById(classGroupId);
  if (!classGroup) {
    return next(createError(404));
  }
  req.classGroup = classGroup;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/sinhvien", sinhvienRouter);
app.use("/export", exportRouter);
app.use("/report", reportRouter);
app.use("/:classGroupId/attendance", classGroupMiddleware, attendanceRouter);
app.use("/:classGroupId/class", classGroupMiddleware, classRouter);
app.use("/:classGroupId/skill", classGroupMiddleware, skillRouter);
app.use("/:classGroupId/score", classGroupMiddleware, scoreRouter);
app.use("/:classGroupId/session", classGroupMiddleware, sessionRouter);
app.use("/:classGroupId/action", classGroupMiddleware, actionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
