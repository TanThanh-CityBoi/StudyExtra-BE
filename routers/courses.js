const express = require("express");
const router = express.Router();
const { AuthMiddleware } = require("../helper/JWT");

const coursesController = require("../controllers/CoursesController");

router.get('/getListUser', coursesController.getListUser)
router.get('/ranking', coursesController.getRanking)
router.post('/new', coursesController.create)
router.get('/getAllCourses', coursesController.getAllCourses);
// router.get('/getCourseInfomation', coursesController.getCourseInfomation);
router.get("/:id", coursesController.getOne);
router.get("/students/:id", coursesController.getCourseStudent);
router.delete("/:id", coursesController._delete);
router.put("/update/:id", coursesController.update);
router.post("/addNewChapter/:id", coursesController.addNewChapter);
router.put("/chapter/:id", coursesController.editChapter);
router.put("/chapter/delete/:id", coursesController.deleteChapter);
router.post("/addNewLesson/:id", coursesController.addLesson);
router.put("/lesson/:id", coursesController.editLesson);
router.put("/lesson/delete/:id", coursesController.deleteLesson);
module.exports = router;
