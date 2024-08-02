const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const HTTP = require("http2").constants;
const nocache = require("nocache");

require("dotenv").config()
require("./src/db");

const indexRouter = require("./src/routes/index");

const MIN = 60 * 1000;

const app = express();

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SERVER_SECRET_KEY));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  cookie: { secure: false, expires: 20 * MIN },
  resave: false,
  saveUninitialized: false,
  secret: process.env.SERVER_SECRET_KEY
}));
app.use(nocache());

app.use("/", indexRouter);

app.use(function (err, req, res) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || HTTP.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  res.render("error");
});

app.use(function (req, res, next) {
  const { error, success } = req.session;

  delete req.session.error;
  delete req.session.success;

  res.locals.message = "";
  if (error) {
    res.locals.message = "<p class=\"msg error\">" + err + "</p>";
  }
  if (success) {
    res.locals.message = "<p class=\"msg success\">" + msg + "</p>";
  }

  next();
});

app.get("*", function (req, res) {
  res.status(404).send("what???");
});

module.exports = app;
