const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
require("./db");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const sinhvienRouter = require("./routes/sinhvien");
const attendanceRouter = require("./routes/attendance");
const classRouter = require("./routes/class");
const skillRouter = require("./routes/skill");
const scoreRouter = require("./routes/score");
const sessionRouter = require("./routes/session");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/sinhvien", sinhvienRouter);
app.use("/attendance", attendanceRouter);
app.use("/class", classRouter);
app.use("/skill", skillRouter);
app.use("/score", scoreRouter);
app.use("/session", sessionRouter);

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
