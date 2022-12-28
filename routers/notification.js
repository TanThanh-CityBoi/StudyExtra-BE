const { AuthMiddleware } = require("../helper/JWT");
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");

router.get(
  "/getUserNotification",
  AuthMiddleware,
  NotificationController.getUserNotification
);
router.post("/createNotification", NotificationController.createNotification);

module.exports = router;
