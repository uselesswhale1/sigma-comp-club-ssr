const db = require("../db");
const express = require("express");
const HTTP = require("http2").constants;
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/", async (req, res, next) => {
  return res.render("auth");
});

router.get("/login-form", async (req, res, next) => {
  return res.render("auth-login");
});

router.get("/signup-form", async (req, res, next) => {
  return res.render("auth-signup");
});

router.post("/logout", function (req, res, next) {
  req.session.destroy(() => {
    console.log("Session Destroyed");

    return res.render("auth", {
      email: "bj.admin@gmail.com"
    });
  });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await db.users.find(email);

    if (!user) {
      const USER_NOT_EXISTS = "User doesn\"t exist";

      return res
        .status(HTTP.HTTP_STATUS_UNAUTHORIZED)
        .send(USER_NOT_EXISTS);
    }

    if (user.isBanned) {
      const USER_BANNED_WITH_REASON = "User is BANNED. Reason: ";

      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send(USER_BANNED_WITH_REASON + user.banReason);
    };

    if (!user.isAdmin) {
      const USER_NOT_ADMIN = "Not an admin. No access";

      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send(USER_NOT_ADMIN);
    };

    const isAuthorized = await bcrypt.compare(password, user.password);

    if (!isAuthorized) {
      const INCORRECT_PASS = "Incorrect password";

      return res
        .status(HTTP.HTTP_STATUS_UNAUTHORIZED)
        .send(INCORRECT_PASS);
    }

    const club = await db.clubs.findByAdmin(user.id);

    req.session.save((er) => {
      if (er) {
        console.error("req.session.save", err);
      }

      req.session.email = user.email;
      req.session.user = user.id;
      req.session.isAdmin = user.isAdmin;
      req.session.club = club.id;

      return res
        .setHeader("HX-Redirect", "/")
        .render("layout");
    })

  } catch (error) {
    return res
      .render("error", { error });
  }
});

router.post("/signup", async function (req, res, next) {
  const { email, password, name } = req.body;

  try {
    if (!email || !name || !password) {
      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send("Check form values");
    }

    const user = await db.users.find(email);

    if (user?.id) {
      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send("User with this email already exists");
    }

    const created = await db.users.create({ name, email, password });

    delete created.password;

    req.session.email = created.email;
    req.session.user = created.id;
    req.session.isAdmin = created.isAdmin;

    res
      .setHeader("HX-Redirect", "/")
      .render("layout");
  } catch (error) {
    next(error)
  }
});

module.exports = router;
