const User = require("../models/users");
const Course = require("../models/courses");
const req = require("express/lib/request");
const res = require("express/lib/response");
const Transaction = require("../models/transaction");

class AccountController {
  getUserCourses = async (req, res) => {
    // const coursesID = req.body.coursesID;

    const username = res.locals.data.username;
    User.findOne({ username: username })
      .exec()
      .then((data) => {
        var ObjectId = require("mongodb").ObjectId;
        let coursesObjectID = [];
        data.courseID.forEach(function (element) {
          let o_id = new ObjectId(element);
          coursesObjectID.push(o_id);
        });

        Course.find({ _id: { $in: coursesObjectID } })
          .exec()
          .then((data) => {
            console.log("data: ", data);
            res.status(200).send(
              JSON.stringify({
                data: data,
              })
            );
          })
          .catch((error) => {
            res.status(404).send(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  uploadAvatar = async (req, res) => {
    const username = res.locals.data.username;
    const avatarUrl = req.body.avatarUrl;
    /* console.log("avatarUrl:", avatarUrl)
     */
    User.updateOne({ username: username }, { $set: { avatar: avatarUrl } })
      .exec()
      .then(() => {
        User.findOne({ username: username })
          .exec()
          .then((data) => {
            console.log("user update: " + data);
            res.status(201).send(
              JSON.stringify({
                user: data,
              })
            );
          })
          .catch((error) => {
            res.status(404).send(error);
          });
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  };

  updateProfile = async (req, res) => {
    const username = res.locals.data.username;
    const name = req.body.fullname;
    const birthday = req.body.birthday;
    const mail = req.body.email;
    const phone = req.body.phone;
    const gender = req.body.gender;

    User.findOne({ username: username })
      .exec()
      .then((data) => {
        console.log("user update: " + data);
        const newInfo = {
          name: name,
          birthday: birthday,
          mail: mail,
          phone: phone,
          gender: gender,
        };
        if (data.mail !== mail) {
          newInfo.emailVerified = false;
        }

        User.updateOne({ username: username }, { $set: newInfo })
          .exec()
          .then((data) => {
            User.findOne({ username: username })
              .exec()
              .then((data) => {
                res.status(200).send(
                  JSON.stringify({
                    message: "update successfully",
                    user: data,
                  })
                );
              })
              .catch((err) => {
                res.status(400).send(
                  JSON.stringify({
                    message: "update failure",
                    error: err,
                  })
                );
              });
          })
          .catch((err) => {
            res.status(400).send(
              JSON.stringify({
                message: "update failure",
                error: err,
              })
            );
          });
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  };

  updateGem = async (req, res) => {
    const gem = req.body.amount;
    const userId = req.body.userId;
    const user = req.body;
    console.log("up date", req.body, userId, gem);

    User.findById(userId)
      .exec()
      .then((user) => {
        const transaction = new Transaction({
          userID: user._id,
          username: user.username,
          amount: Math.abs(parseInt(gem) - parseInt(user.gem)),
          balance: gem,
          status: "complete",
          type:
            parseInt(gem) - parseInt(user.gem) > 0 ? "increase" : "reduction",
          note: "Chỉnh sửa bởi Admin",
        });
        console.log(transaction, "transaction nè");

        transaction.save().then((transaction) => {
          user.gem = gem;
          user.transactions.push(transaction._id);
          user.save().then((user) => {
            res.status(200).send(
              JSON.stringify({
                data: user,
              })
            );
          });
        });
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  };

  userBuyCourse = async (req, res) => {
    try {
      console.log(req.body);
      const courseID = req.body.courseId;
      const username = req.body.username;

      

      const user = await User.findOne({ username }).exec();
      const course = await Course.findById(courseID).exec();

      console.log({user,course})
      // Check đã mua khóa học hay chưa
      if (course.studentIds.includes(user._id)) {
        res.status(200).send(
          JSON.stringify({
            status: 0,
            message: "Bạn đã mua khóa học",
          })
        );
      } else {
        // Check user và courses tồn tại để thêm khóa học vào database
        if (user && course) {
          if (user.gem < course.price) {
            res.status(500).send(
              JSON.stringify({
                status: 0,
                message: "Vui lòng nạp thêm GEM để tiếp tục sử dụng dịch vụ",
              })
            );

            return;
          }
          user.courseID.push(course._id);
          course.studentIds.push(user._id);
          await course.save()
          user.gem = user.gem - course.price;
          user.point = user.point ? user.point + 25: 25;

          const transaction = new Transaction({
            userID: user._id,
            username: user.username,
            amount: course.price,
            balance: user.gem,
            status: "complete",
            type: "reduction",
            note: `Mua khóa học: ${course.name}`,
          });
          console.log(transaction, "transaction nè");

          transaction.save().then((transaction) => {
            user.transactions.push(transaction._id);
            user
              .save()
              .then((user) => {
                res.status(200).send(
                  JSON.stringify({
                    status: 1,
                    message: "Mua khóa học thành công",
                    data: course,
                  })
                );
              })
              .catch((err) => {
                res.status(401).send(
                  JSON.stringify({
                    status: 0,
                    message: "Lỗi hệ thống",
                  })
                );
              });
          });
        }
      }

      // await User.findOne({ username })
      //     .populate("courses")
      //     .exec()
      //     .then(result => {
      //         console.log(result)
      //     })
    } catch (err) {
      res.status(401).send(
        JSON.stringify({
          status: 0,
          message: "Lỗi hệ thống",
        })
      );
    }
  };
}

module.exports = new AccountController();
