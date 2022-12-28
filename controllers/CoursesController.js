const { RenameObjectKey } = require("../helper/RenameObjectKey");
const Chapter = require("../models/chapter");
const Course = require("../models/courses");
const Lesson = require("../models/lessons");
const Users = require("../models/users")
const ObjectId = require("mongodb").ObjectID;
class CoursesController {
  getAllCourses = async (req, res) => {
    Course.find()
      .populate("chapters")
      .exec()
      .then((data) => {
        res.status(200).send(
          JSON.stringify({
            data: data,
          })
        );
      })
      .catch((error) => {
        res.status(404).send(error.toString());
      });
  };

  update = async (req, res) => {
    const id = req.params.id;
    const course = req.body;

    Course.findOneAndUpdate(
      {
        courseId: id,
      },
      {
        $set: {
          ...course,
        },
      },
      {
        returnOriginal: false,
      },
      function (err, data) {
        if (err) {
          res.status(404).send(err);
        } else {
          res.status(200).send(JSON.stringify(data));
        }
      }
    );
  };

  _delete = async (req, res) => {
    var id = req.params.id;
    Course.deleteOne({ _id: ObjectId(id) })
      .then((data) => {
        res.status(200).send(JSON.stringify(data));
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  };

  getOne = async (req, res) => {
    const id = req.params.id;
    Course.findOne({ courseId: id })
      .populate({
        path: "chapters",
        populate: { path: "lessons" },
      })
      .exec()
      .then((course) => {
        if (course) {
          res.status(200).send(
            JSON.stringify({
              data: course,
            })
          );
        } else {
          res.status(404).send({ message: "Course not found" });
        }
      })
      .catch((error) => {
        res.status(404).send(error.toString());
      });
  };

  getCourseStudent = async (req, res) => {
    const id = req.params.id;
    Course.findOne({ courseId: id })
      .populate({
        path: "studentIds",
      })
      .exec()
      .then((course) => {
        if (course) {
          res.status(200).send(
            JSON.stringify({
              data: course.studentIds,
            })
          );
        } else {
          res.status(404).send({ message: "Course not found" });
        }
      })
      .catch((error) => {
        res.status(404).send(error.toString());
      });
  };

  create = async (req, res) => {
    console.log("Tạo khóa học nè");
    console.log(req.body);
    const course = req.body;
    const id = req.body._id;
    Course.findOne({ courseId: id })
      .exec()
      .then((data) => {
        if (data) {
          res.status(404).send(
            JSON.stringify({
              message: "ID duplicated",
            })
          );
        } else {
          console.log("debug", { course, id });
          const _course = new Course({
            courseId: id,
            name: course.name,
            description: course.description,
            contents: course.contents,
            requirements: course.requirements,
            price: course.price,
            imgUrl: course.imgUrl,
            introVideoUrl: course.introVideoUrl,
            categories: course.categories || [],
            rating: [],
            studentIds: [],
            chapters: [],
            isHide: false,
          });

          console.log("debug 2", _course);
          _course
            .save()
            .then((data) => {
              res.status(200).send(JSON.stringify(data));
            })
            .catch((err) => {
              console.log(err);
              res.status(404).send(err);
            });
        }
      });
  };

  // getCourseInfomation = async (req, res) => {
  //   const _id = req.body._id;
  //   console.log(_id);
  //   Course.findOne({ _id: ObjectId(_id) })
  //     .exec()
  //     .then((data) => {
  //       res.status(200).send(
  //         JSON.stringify({
  //           data: data,
  //         })
  //       );
  //     })
  //     .catch((error) => {
  //       res.status(404).send(error);
  //     });
  // };

  addNewChapter = async (req, res) => {
    console.log(req.params.id);
    Course.findOne({
      _id: ObjectId(req.params.id),
    })
      .exec()
      .then((data) => {
        if (data) {
          Chapter.findOne({
            name: req.body.name,
          })
            .exec()
            .then((course) => {
              if (course) {
                res.status(400).send(
                  JSON.stringify({
                    message: "Name duplicated",
                  })
                );
              } else {
                const { name, index } = req.body;
                const _lesson = new Chapter({
                  name,
                  courseId: req.params.id,
                  lessons: [],
                });
                _lesson
                  .save()
                  .then((chapter) => {
                    Course.findById(req.params.id, function (err, course) {
                      if (!err) {
                        course.chapters.splice(index, 0, chapter._id);
                        course.save().then((editedCourse) => {
                          res.redirect(
                            `../../courses/${editedCourse.courseId}`
                          );
                        });
                      }
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(404).send(err);
                  });
              }
            });
        } else {
          res.status(404).send({ message: "Course not found" });
        }
      });
  };

  editChapter = async (req, res) => {
    const id = req.params.id;
    const chapter = req.body;
    Chapter.findOneAndUpdate(
      {
        _id: ObjectId(id),
      },
      {
        $set: {
          ...chapter,
        },
      },
      {
        returnOriginal: false,
      },
      function (err, chapter) {
        if (err) {
          res.status(404).send(err);
        } else {
          Course.findById(chapter.courseId, function (err, course) {
            if (!err) {
              if (course.chapters.indexOf(chapter._id) != req.body.index) {
                course.chapters.splice(course.chapters.indexOf(chapter._id), 1);
                course.chapters.splice(req.body.index, 0, chapter._id);
              }
              course.save().then((editedCourse) => {
                res.redirect(303, `../../courses/${editedCourse.courseId}`);
              });
            } else {
              res.status(500).send(JSON.stringify(err));
            }
          });
        }
      }
    );
  };

  deleteChapter = async (req, res) => {
    const id = req.params.id;
    const courseId = req.body.courseId;
    Chapter.deleteOne({ _id: ObjectId(id) })
      .then((data) => {
        Course.findById(courseId, function (err, course) {
          if (!err) {
            course.chapters.splice(course.chapters.indexOf(id), 1);
            course.save().then((editedCourse) => {
              res.redirect(303, `../../../courses/${editedCourse.courseId}`);
            });

            Lesson.deleteMany({ chapterId: id })
              .then((data) => {
                console.log({ data });
              })
              .catch((err) => {
                console.log({ err });
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

  deleteLesson = async (req, res) => {
    const id = req.params.id;
    const chapterId = req.body.chapterId;
    Lesson.deleteOne({ _id: ObjectId(id) })
      .then((data) => {
        Chapter.findById(chapterId, function (err, chapter) {
          if (!err && chapter) {
            chapter.lessons.splice(chapter.lessons.indexOf(id), 1);
            chapter.save().then((editedChapter) => {
              Course.findById(editedChapter.courseId)
                .then((course) => {
                  res.redirect(303, `../../../courses/${course.courseId}`);
                })
                .catch((err) => {
                  console.log(err, "err nè");
                  res.status(400).send({ message: err });
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

  addLesson = async (req, res) => {
    console.log(req.params.id);

    Chapter.findOne({
      _id: ObjectId(req.params.id),
    })
      .exec()
      .then((data) => {
        if (data) {
          Lesson.findOne({
            chapterId: req.params.id,
            name: req.body.name,
          })
            .exec()
            .then((lesson) => {
              if (lesson) {
                res.status(400).send(
                  JSON.stringify({
                    message: "Name duplicated",
                  })
                );
              } else {
                console.log("Tạo");
                const { videoUrl, documentUrl, name, chapter, index } =
                  req.body;
                const _lesson = new Lesson({
                  name,
                  documentUrl,
                  chapterId: chapter,
                  videoUrl,
                });
                _lesson
                  .save()
                  .then((lesson) => {
                    Chapter.findById(req.params.id, function (err, chapter) {
                      if (!err) {
                        chapter.lessons.splice(index, 0, lesson._id);
                        chapter.save().then((editedChapter) => {
                          Course.findById(editedChapter.courseId)
                            .then((course) => {
                              res.redirect(`../../courses/${course.courseId}`);
                            })
                            .catch((err) => {
                              console.log(err, "err nè");
                              res.status(400).send({ message: err });
                            });
                        });
                      }
                    });
                  })
                  .catch((err) => {
                    console.log(err, "err nè");
                    res.status(400).send({ message: err });
                  });
              }
            });
        } else {
          res.status(404).send({ message: "Course not found" });
        }
      });
  };

  editLesson = async (req, res) => {
    const id = req.params.id;
    const lesson = req.body;
    Lesson.findOneAndUpdate(
      {
        _id: ObjectId(id),
      },
      {
        $set: {
          ...lesson,
        },
      },
      {
        returnOriginal: false,
      },
      function (err, lesson) {
        if (err) {
          res.status(404).send(err);
        } else {
          Chapter.findById(lesson.chapterId, function (err, chapter) {
            if (!err) {
              if (chapter.lessons.indexOf(lesson._id) != req.body.index) {
                chapter.lessons.splice(chapter.lessons.indexOf(lesson._id), 1);
                chapter.lessons.splice(req.body.index, 0, lesson._id);
              }
              chapter.save().then((editedChapter) => {
                Course.findById(editedChapter.courseId)
                  .then((course) => {
                    res.redirect(303, `../../courses/${course.courseId}`);
                  })
                  .catch((err) => {
                    console.log(err, "err nè");
                    res.status(400).send({ message: err });
                  });
              });
            } else {
              res.status(500).send(JSON.stringify(err));
            }
          });
        }
      }
    );
  };

  getRanking = async (req, res) => {
    const users = await Users.find()

    users.sort((firstItem, secondItem) => secondItem.point - firstItem.point)

    res.status(200).send(JSON.stringify({
      data: users,
      status: 200,
    }))
  }

  getListUser = async (req, res) => {
    const users = await Users.find()
      .populate("courseID")
      .exec()

    const courses = await Course.find()
    res.status(200).send(JSON.stringify({
      data: users,
      courses,
      status: 200,
    }))
  }

}

module.exports = new CoursesController();
