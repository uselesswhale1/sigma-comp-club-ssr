const express = require("express");
const HTTP = require("http2").constants;
const db = require("../db");
const router = express.Router();

router.get("/", async function (req, res) {
  if (!req.session.email) {
    return res
      .status(HTTP.HTTP_STATUS_UNAUTHORIZED)
      .setHeader("HX-Redirect", "/auth")
      .send("please auth")
  }

  const { id, name } = await db.clubs.findByAdmin(req.session.user);

  return res
    .render("index", {
      clubId: id,
      clubName: name,
      email: req.session.email,
    });
});

router.get("/:resource", async function (req, res, next) {
  const RESOURCES = ["clubs", "users", "computers", "games"];

  const { resource } = req.params;

  const isUnknownResource = !RESOURCES.includes(resource);

  if (isUnknownResource) {
    return res
      .status(HTTP.HTTP_STATUS_BAD_REQUEST)
      .send("worst request ever");
  };

  const items = await db[resource].getDetailed(req.session.club, req.session.user);

  return res.render(resource, { [resource]: items });
});

module.exports = router;
