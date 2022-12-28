const Exam = require("../models/exam");
const Course = require("../models/courses")
const { RemoveAccents } = require('../helper/RemoveAccent');

class SearchController {
    getSearchData = async (req, res) => {
        try {
            const listExam = await Exam.find().exec()
            const listCourse = await Course.find().exec()
            let slug = RemoveAccents(req.query.search)
            const examRes = listExam.filter(exam => {
                return RemoveAccents(exam.name).includes(slug)
            })
            const courseRes = listCourse.filter(course => {
                return RemoveAccents(course.name).includes(slug)
            })
            res.status(200).send(
                JSON.stringify({
                    exam: examRes.length == 0 ? [] : examRes,
                    course: courseRes.length == 0 ? [] : courseRes,
                })
            )
        } catch {
            console.log("Fail connect")
        }

    }

    raiseViewExam = async (req, res) => {
        try {
            console.log('tăng thành công')
            console.log(req.body._id)
            let newView = req.body.view + 1;
            console.log(newView)
            Exam.findOneAndUpdate(
                { name: req.body.name },
                {
                    $set: {
                        view: newView
                    }
                },
                { returnOriginal: false }
            ).exec()
                .then(result => {
                    if (result) {
                        res.status(201).send(JSON.stringify({
                            status: 200,
                            message: 'successfully',
                            data: result,
                        }))
                    } else {
                        res.send(403).send(JSON.stringify({
                            status: 403,
                            message: 'failure'
                        }))
                    }
                })
                .catch(err => {
                    console.log('lỗi')
                    res.send(403).send(JSON.stringify({
                        status: 403,
                        message: 'failure'
                    }))
                })
            // Exam.findByIdAndUpdate(req.body._id, { view: newView },
            //     function (err, result) {
            //         if (err) {
            //             res.send(403).send(JSON.stringify({
            //                 status: 403,
            //                 message: 'failure'
            //             }))
            //         }
            //         else {
            //             res.status(201).send(JSON.stringify({
            //                 status: 200,
            //                 message: 'successfully',
            //                 data: result,
            //             }))
            //         }
            //     });
            // Exam.findByIdAndUpdate(req.body._id,
            //     {
            //         view: newView
            //     },
            //     { returnOriginal: false }
            // ).exec()
            //     .then(result => {
            //         if (result) {
            //             res.status(201).send(JSON.stringify({
            //                 status: 200,
            //                 message: 'successfully'
            //             }))
            //         } else {
            //             res.send(403).send(JSON.stringify({
            //                 status: 403,
            //                 message: 'failure'
            //             }))
            //         }
            //     })
            //     .catch(err => {
            //         console.log('lỗi')
            //         res.send(403).send(JSON.stringify({
            //             status: 403,
            //             message: 'failure'
            //         }))
            //     })

        } catch (err) {
            console.log('Fail connect')
        }
    }
}

module.exports = new SearchController();