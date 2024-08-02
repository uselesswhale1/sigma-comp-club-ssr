const db = require("../db");
const express = require("express");
const HTTP = require("http2").constants;
const router = express.Router();

router.post("/stash", async (req, res, next) => {
  const { id, reason } = req.body;

  try {
    const result = await db.computers.stash(id, reason);

    if (!result.changedRows) {
      return res
        .status(HTTP.HTTP_STATUS_UNPROCESSABLE_ENTITY)
        .send("failed to stash");
    }

    return res
      .status(HTTP.HTTP_STATUS_OK)
      .redirect("/computers");
  } catch (error) {
    next(error)
  }
});

router.post("/unstash", async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res
      .status(HTTP.HTTP_STATUS_BAD_REQUEST)
      .send("no id in request body");
  }

  try {
    const { changedRows } = await db.computers.unstash(id);

    if (!changedRows) {
      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send("failed to unstash");
    }

    return res
      .status(HTTP.HTTP_STATUS_OK)
      .redirect("/computers");
  } catch (error) {
    next(error)
  }
});

router.post("/unbook", async (req, res, next) => {
  const id = req.body.id;

  try {
    const result = await db.computers.unbook(id);

    if (!result.changedRows) {
      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send(`<p id="unbook-error-${id}">failed to unbook</p>`);
    }

    const [computer] = await db.computers.getDetailed(req.session.club, null, id);

    return res
      .status(HTTP.HTTP_STATUS_OK)
      .render("comp-table-row", { computer });
  } catch (error) {
    next(error)
  }
});

router.post("/book", async (req, res, next) => {
  const { id, email } = req.body;

  try {
    const user = await db.users.find(email);

    if (!user) {
      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send(`<p id="book-error-${id}">User doesn\"t exist</p>`);
    };

    if (user.isBanned) {
      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send(`<p id="book-error-${id}">BANNED for: ${user.banReason}</p>`);
    };

    const result = await db.computers.book(id, user.id);

    if (!result.changedRows) {
      return res
        .status(HTTP.HTTP_STATUS_FORBIDDEN)
        .send(`<p id="book-error-${id}">failed to update</p>`);
    }

    const [computer] = await db.computers.getDetailed(req.session.club, null, id);

    return res
      .status(HTTP.HTTP_STATUS_OK)
      .render("comp-table-row", { computer });
  } catch (error) {
    next(error)
  }
});

router.get("/book-form/:id", function (req, res) {
  const { id } = req.params;

  return res.render("comp-book-form", {
    id,
    email: "haha@gmail.com",
  });
});

router.get("/stash-form/:id", function (req, res) {
  const id = req.params.id;

  return res.render("comp-stash-form", {
    id,
    reason: "haha broken hehe",
  });
});

module.exports = router;
