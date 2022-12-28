const { AuthMiddleware } = require('../helper/JWT');
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')

router.post("/login", AuthController.login)
router.post("/register", AuthController.register)
router.get("/refresh", AuthMiddleware, AuthController.refresh);
router.get("/:id/verify/:token/", AuthController.verifyEmail);
router.post("/sendVerifyCode", AuthController.sendVerifyCode);//forgot password
router.post("/verifyCode", AuthController.verifyCode);//forgot password
router.post("/setNewPassword", AuthController.setNewPassword);//forgot password
router.post("/resetPassword", AuthMiddleware, AuthController.resetPassword);//reset password password
router.get("/resendVerifyEmail", AuthMiddleware,  AuthController.resendVerifyEmail);//


module.exports = router;
