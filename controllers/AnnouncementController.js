const Announcement = require("../models/announcement");
const User = require("../models/users")
class NotificationGenarelController {
    getAllAnnouncement = async (req, res) => {
        Announcement.find()
            .populate("user")
            .exec()
            .then((data) => {
                console.log('thành công')
                res.status(200).send(
                    JSON.stringify({
                        status: 200,
                        data: data
                    })
                )
            })
            .catch((error) => {
                console.log('thất bại')
                res.status(404).send();
            })
    }

    deleteAnnouncement = async (req, res) => {
        const { slug } = req.body
        console.log(slug)
        Announcement.findOneAndDelete({ slug })
            .then((result) => {
                console.log(result)
                if (result) {
                    res.status(200).send(
                        JSON.stringify({
                            status: 200,
                            message: 'Delete success!'
                        })
                    )
                } else {
                    res.status(200).send(
                        JSON.stringify({
                            status: 401,
                            message: 'Delete failed!'
                        })
                    )
                }
            })
            .catch(err => {
                res.status(401).send(
                    JSON.stringify({
                        status: 401,
                        message: 'Delete failed!'
                    })
                )
            })
    }

    updateAnnouncement = async (req, res) => {
        const { slug, content, title } = req.body
        Announcement.updateOne(
            { slug },
            {
                content,
                title
            }
        )
            .then(result => {
                if (result) {
                    res.status(200).send(
                        JSON.stringify({
                            status: 200,
                            message: 'Update success!'
                        })
                    )
                } else {
                    res.status(200).send(
                        JSON.stringify({
                            status: 401,
                            message: 'Update failed!'
                        })
                    )
                }
            })
            .catch(err => {
                res.status(401).send(
                    JSON.stringify({
                        status: 401,
                        message: 'Delete failed!'
                    })
                )
            })
    }

    createAnnouncement = async (req, res) => {
        const { title, content, idUser } = req.body
        //const user = await User.findById(idUser).exec()
        console.log(idUser)
        const newAnnouncement = new Announcement({
            content,
            title,
            user: idUser,
        })
        newAnnouncement.save()
            .then((data) => {
                res.status(201).send(
                    JSON.stringify({
                        message: "Add new announcement success!",
                        data
                    })
                )
            })
            .catch(err => {
                res.status(401).send(
                    JSON.stringify({
                        message: "Add new announcement failed!",
                    })
                )
            })
    }


    getOneAnnoucement = async (req, res) => {
        const { slug } = req.params
        Announcement.findOne({ slug }).exec()
            .then((data) => {
                if (data) {
                    res.status(200).send(
                        JSON.stringify({
                            status: 200,
                            data: data
                        })
                    )
                } else {
                    res.status(200).send(
                        JSON.stringify({
                            status: 401,
                        })
                    )
                }

            })
            .catch((error) => {
                res.status(404).send(error);
            })
    }
}

module.exports = new NotificationGenarelController();