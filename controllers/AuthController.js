const User = require("../models/users");
const Token = require("../models/emailtoken");
const PasswordToken = require("../models/passwordtoken");
const { JWTAuthToken } = require("../helper/JWT");
const crypto = require("crypto");
const SendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken");
const req = require("express/lib/request");
const res = require("express/lib/response");
const saltRounds = 10;

class AuthController {
  register = async (req, res) => {
    const username = req.body.username;
    const password = bcrypt.hashSync(req.body.password, saltRounds);
    const name = req.body.fullname;
    const phone = req.body.phone;
    const role = "user";
    const mail = req.body.email;
    const emailVerified = false;
    const avatar = "/default-avatar";
    const courseID = [];
    const gem = 0;
    const birthday = req.body.birthday;
    const pointID = [];
    const gender = req.body.gender;
    console.log({ username, password });

    User.findOne({ username: username })
      .exec()
      .then((data) => {
        if (data) {
          res.status(409).send(
            JSON.stringify({
              message: "Username has been used",
            })
          );
        } else {
          const newUser = new User({
            username,
            password,
            name,
            phone,
            role,
            mail,
            emailVerified,
            avatar,
            courseID,
            gem,
            birthday,
            pointID,
            gender,
            isLock: false,
          });

          newUser.save().then((data) => {
            res.status(201).send(
              JSON.stringify({
                message: "Sign up successfully",
                token: JWTAuthToken({
                  username,
                  userId: data._id,
                  role: data.role,
                }),
                username,
                data,
              })
            );

            const token = new Token({
              username: username,
              token: crypto.randomBytes(32).toString("hex"),
            })
              .save()
              .then((data) => {
                console.log("verify email token: ", data);
                const url = `${process.env.FE_URL}/xac-nhan-email/${username}/${data.token}`;
                SendEmail.verifyEmail(mail, "Verify Email", url);
              });
          });
        }
      })
      .catch((err) => {
        res.send(
          JSON.stringify({
            status: -1,
            message: err.message,
          })
        );
      });
  };
  //---------------------------------------------------------------LOGIN--------------------------------------------------------------------------//
  login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username })
      .exec()
      .then((data) => {
        //check password, if password is correct then get all data and respond for client
        if (bcrypt.compareSync(password, data.password)) {
          const { password, ...user } = data._doc;

          res.status(200).send(
            JSON.stringify({
              message: "Login successfully",
              user: user,
              token: JWTAuthToken({
                username,
                userId: data._id,
                role: data.role,
              }),
            })
          );
        } else {
          throw new Error();
        }
      })
      .catch((err) => {
        res.status(401).send(
          JSON.stringify({
            message: "Login error, wrong username or password",
          })
        );
      });
  };
  //---------------------------------------------------------------------------------------------------------------------------------------------//
  refresh = async (req, res) => {
    console.log("Access to auth controller success");
    res.status(200).send(
      JSON.stringify({
        status: "HIIH",
        message: "This is message",
        token: "This is token",
        email: "This is email",
        data: res.locals.data,
      })
    );
  };

  //----------------------------------------------------verify-email-----------------------------------------------------------------------------//
  verifyEmail = async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.id });
      if (!user) return res.status(400).send("user not found");
      console.log("user: ", user);
      const token = await Token.findOne({
        username: user.username,
        token: req.params.token,
      });
      if (!token) return res.status(400).send("token not found");

      await User.updateOne(
        { username: user.username },
        { emailVerified: true }
      );
      await token.remove();

      res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
      res.status(400).send(error.toString());
    }
  };

  sendVerifyCode = async (req, res) => {
    const username = req.body.username;
    await PasswordToken.deleteMany({ username: username })
      .exec()
      .then(() => console.log("old tokens has deleted!"))
      .catch((err) => {
        return res.status(400).send(err);
      });

    await User.findOne({ username: username })
      .exec()
      .then((data) => {
        if (!data) return res.status(400).send("user not found");
        const mail = data.mail;
        const token = new PasswordToken({
          username: username,
          token: Math.random().toString(16).substring(2, 8),
        })
          .save()
          .then((data) => {
            console.log("forgot password token: ", data);
            SendEmail.verifyPassword(mail, "Verify Password", data.token)
              .then(() => {
                res.status(200).send(
                  JSON.stringify({
                    email: mail,
                    message: "Email sent successfully",
                  })
                );
              })
              .catch((error) => {
                return res.status(400).send(
                  JSON.stringify({
                    message: error,
                  })
                );
              });
          })
          .catch((err) => {
            res.status(400).send(
              JSON.stringify({
                message: "Send email failure, token has existed",
                error: err.toString(),
              })
            );
          });
      })
      .catch((err) => {
        res.status(400).send(
          JSON.stringify({
            message: "User not found",
            error: err.toString(),
          })
        );
      });
  };

  verifyCode = async (req, res) => {
    const username = req.body.username;
    const verifyCode = req.body.verifyCode;

    const token = await PasswordToken.findOne({
      username: username,
      token: verifyCode,
    });
    if (!token) return res.status(400).send({ message: "Invalid code" });

    res.status(200).send({ message: "Valid code" });
  };

  setNewPassword = async (req, res) => {
    try {
      const newPassword = req.body.newPassword;
      const username = req.body.username;
      const verifyCode = req.body.verifyCode;
      const token = await PasswordToken.findOne({
        username: username,
        token: verifyCode,
      });
      if (!token) return res.status(400).send("Invalid code");

      const user = await User.updateOne(
        { username: username },
        { password: bcrypt.hashSync(newPassword, saltRounds) }
      ).exec();
      if (user) {
        // await token.remove();
        return res.status(200).send({ message: "Update successfully" });
      }
      return res.status(400).send({ message: "Update failure" });
    } catch (error) {
      return res.status(400).send({ message: "Update failure" });
    }
  };

  resetPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const username = res.locals.data.username;

    User.findOne({ username: username })
      .exec()
      .then((data) => {
        if (!data) return res.status(400).send("User not found");
        if (!bcrypt.compareSync(oldPassword, data.password))
          return res.status(400).send("Password is not correct");
        User.updateOne(
          { username: username },
          { password: bcrypt.hashSync(newPassword, saltRounds) }
        )
          .exec()
          .then(() => {
            res.status(200).send(
              JSON.stringify({
                message: "success",
              })
            );
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  };

  resendVerifyEmail = async (req, res) => {
    const username = res.locals.data.username;
    // const username = "tanthanh1"
    await Token.deleteMany({ username: username })
      .exec()
      .then(() => console.log("Old email tokens has deleted!"))
      .catch((err) => {
        console.log(err);
      });

    await User.findOne({ username: username })
      .exec()
      .then((data) => {
        if (!data) return res.status(400).send("user not found");
        const mail = data.mail;
        const token = new Token({
          username: username,
          token: crypto.randomBytes(32).toString("hex"),
        })
          .save()
          .then((data2) => {
            console.log("verify email token: ", data2);
            const url = `${process.env.FE_URL}/xac-nhan-email/${username}/${data2.token}`;
            SendEmail.verifyEmail(mail, "Verify Email", url)
              .then((data) => {
                res.status(200).send(
                  JSON.stringify({
                    message: "Verify link has sent to your email",
                  })
                );
              })
              .catch((error) => {
                res.status(400).send(
                  JSON.stringify({
                    message: error,
                  })
                );
              });
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  };
}

module.exports = new AuthController();
