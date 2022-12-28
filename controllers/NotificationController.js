const Notification = require("../models/notification");
const User = require("../models/users");
class NotificationController {
  getUserNotification = async (req, res) => {
    const username = res.locals.data.username;

    Notification.find({ username: username })
      .populate("creator")
      .exec()
      .then((data) => {
        console.log("data notification: ", data);
        res.status(200).send(
          JSON.stringify({
            data: data,
          })
        );
      })
      .catch((error) => {
        throw Error(error.toString());
      });
  };

  createNotification = async (req, res) => {
    try {
      const newNotification = new Notification({
        username: req.body.username,
        content: req.body.content,
        type: req.body.type,
        creator: req.body.creator,
        fileUrl: req.body.fileUrl,
      });
      console.log("not: ", newNotification);

      newNotification.save();

      const user = await User.findById(newNotification.creator).exec();
      console.log(user);
      user.notifications.push(newNotification._id);
      user.save();
      res.status(201).send(
        JSON.stringify({
          message: "Create notification successfully",
        })
      );

      res.status(400).send(error);
    } catch (error) {}
  };
}

module.exports = new NotificationController();
