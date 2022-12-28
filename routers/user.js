const { AuthMiddleware } = require("../helper/JWT");
const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/", userController.getAllUser);
router.get("/getCurrentUser", AuthMiddleware, userController.getCurrentUser);
router.get(
  "/getCurrentUserExam",
  AuthMiddleware,
  userController.getCurrentUserExam
);
router.get("/getUserExam/:id", AuthMiddleware, userController.getUserExam);
router.get("/:id", AuthMiddleware, userController.getUser);
router.post("/lock/:id", userController.toogleLockState);
router.delete("/:id", userController._delete);

module.exports = router;
