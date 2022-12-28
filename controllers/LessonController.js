const Chapter = require("../models/chapter");
const Course = require("../models/courses");
var mongoose = require('mongoose');
const Lesson = require("../models/lessons");

class LessonController {
    getCourseInfoByCourseID = async(req, res) => {
        console.log("req.body", req.body);
        console.log("req.params.id", req.params.id);

        let currentCourseChapter;
        await Course.find({
            "courseId" : req.params.id
        }).populate("chapters")
        .exec()
        .then((data) => {
            console.log(data);
            currentCourseChapter = data[0];
        })
        .catch((error) => {
            return res.status(404).send({
                success: false
            });
        });

        // var allLesson = [];
        // await Lesson.find()
        //     .then((data) => {
        //         allLesson = data;
        //     })
        //     .catch((error) => {

        //     })
        // console.log(allLesson);

        var lessonWithChapter = [];
        for(let i = 0; i < currentCourseChapter.chapters.length; i++){
            await Chapter.findById(currentCourseChapter.chapters[i]).populate('lessons')
            .then((data) => {
                currentCourseChapter.chapters[i] = data;
            })
            .catch((error) => {

            })
        }


        

        console.log(lessonWithChapter);

        res.status(200).send({
            run: true,
            currentCourseChapter: currentCourseChapter
        })
    }
    saveNotion = async(req, res) => {
        console.log("req.body", req.body);
        let lessonA ;
        await Lesson.findById(req.body.lessonID)
        .then(data => {
            lessonA = data;
        })
        .catch((error) => {
            return res.status(400).send({
                success: false,
            })
        })

        let currentNote = lessonA.notes;
        console.log("currentNote", currentNote);
        currentNote = currentNote.filter((item) => {
            return item.userID !== req.body.userID;
        })

        currentNote.push({
            userID: req.body.userID,
            note: req.body.content,
        })

        await Lesson.findByIdAndUpdate(req.body.lessonID, {
            notes: currentNote,        
        })
            .then(data => {
                res.status(200).send({
                    success: true,
                })
            })
            .catch((error) => {
                return res.status(400).send({
                    success: false,
                })
            })
        
    }
}

module.exports = new LessonController();