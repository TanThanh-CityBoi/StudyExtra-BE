const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const ExamSchema = new Schema ({
    name: {
        type: String,
        required: true,
    },
    courseID: String,
    testCount: Number,
    requirement: Array,
    attempt: {
        type: Number,
        default: 0
    },
    detail: String,
    description: String,
    questionPoint: Number,
    listQuestion: Array,
    time: Number,//phút,
    typeCategory: String
},
    { timestamps: true }
);

const Exam = mongoose.model('exam', ExamSchema);
module.exports = Exam;