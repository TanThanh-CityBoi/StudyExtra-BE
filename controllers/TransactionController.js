const User = require("../models/users");
const Transaction = require("../models/transaction");
const { ObjectId, ObjectID } = require("mongodb");

class TransactionController {
  createDepositRequest = async (req, res) => {
    // const username = "tanthanh3"
    const username = res.locals.data.username;
    const amount = req.body.amount;
    const context = req.body.context;

    try {
      const user = await User.findOne({ username: username }).exec();
      if (!user)
        return res.status(400).send(
          JSON.stringify({
            message: "user not found",
          })
        );
      const balance = user.gem + amount;
      const transaction = new Transaction({
        userID: user._id,
        username: username,
        amount: amount,
        balance: balance,
        status: "waiting",
        type: "increase",
        context: context,
        note: "Nạp GEM vào tài khoản",
      });
      transaction
        .save()
        .then((data) => {
          res.status(200).send(
            JSON.stringify({
              message: "Successfully",
              data: data,
            })
          );
        })
        .catch((error) => {
          res.status(400).send(error);
        });
    } catch (error) {
      res.status(400).send(error);
    }
  };
  getUserTransaction = async (req, res) => {
    // const username = 'tanthanh3'
    const username = res.locals.data.username;
    Transaction.find({ username: username, status: "complete" })
      .sort({ createdAt: -1 })
      .exec()
      .then((data) => {
        res.status(200).send(
          JSON.stringify({
            data: data,
            message: "success",
          })
        );
      })
      .catch((error) => {
        res.status(400).send(
          JSON.stringify({
            message: "failure",
            error: error,
          })
        );
      });
  };

  getDepositeGemRequest = async (req, res) => {
    Transaction.find({ status: "waiting" })
      .populate("userID")
      .exec()
      .then((data) => {
        data.forEach((transaction) => {
          transaction.userID.password = undefined;
        });
        res.status(200).send(
          JSON.stringify({
            data: data,
            message: "success",
          })
        );
      })
      .catch((error) => {
        res.status(400).send(
          JSON.stringify({
            message: "failure",
            error: JSON.stringify(error),
          })
        );
      });
  };

  _delete = async (req, res) => {
    const id = req.params.id;
    const userID = req.body.userID;
    Transaction.deleteOne({ _id: ObjectId(id) })
      .then((data) => {
        User.findById(userID, function (err, user) {
          if (!err && user) {
            user.transactions.splice(user.transactions.indexOf(id), 1);
            user.save().then((data) => {
              Transaction.find({ status: "waiting" })
                .populate("userID")
                .exec()
                .then((data) => {
                  data.forEach((transaction) => {
                    transaction.userID.password = undefined;
                  });
                  res.status(200).send(
                    JSON.stringify({
                      data: data,
                      message: "success",
                    })
                  );
                })
                .catch((error) => {
                  res.status(400).send(
                    JSON.stringify({
                      message: "failure",
                      error: JSON.stringify(error),
                    })
                  );
                });
            });
          } else {
            res.status(500).send(JSON.stringify(err));
          }
        });
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  };

  confirm = async (req, res) => {
    const id = req.params.id;
    const userID = req.body.userID;
    Transaction.findOne({ _id: ObjectID(id) })
      .then((transaction) => {
        transaction.status = "complete";
        transaction.save().then((transaction) => {
          User.findById(transaction.userID, function (err, user) {
            if (!err && user) {
              if (user.gem) {
                user.gem = user.gem + transaction.amount;
              } else {
                user.gem = transaction.amount;
              }
              user.transactions.push(transaction._id)
              user.save().then((data) => {
                Transaction.find({ status: "waiting" })
                  .populate("userID")
                  .exec()
                  .then((data) => {
                    data.forEach((transaction) => {
                      transaction.userID.password = undefined;
                    });
                    res.status(200).send(
                      JSON.stringify({
                        data: data,
                        message: "success",
                      })
                    );
                  })
                  .catch((error) => {
                    res.status(400).send(
                      JSON.stringify({
                        message: "failure",
                        error: JSON.stringify(error),
                      })
                    );
                  });
              });
            } else {
              res.status(500).send(JSON.stringify(err));
            }
          });
        });
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  };

  getAllTransaction = async (req, res) => {
    const transaction = await Transaction.find()

    res.status(200).send(JSON.stringify({
      data: transaction,
      status: 200,
    }))
  }

}

module.exports = new TransactionController();
