const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const LessonsSchema = new Schema ({
    chapterId: { type: Schema.Types.ObjectId, ref: 'chapters' },
    name: String,
    videoUrl: String,
    documentUrl: String,
    notes: [
        {
            userID: String,
            note: String,
        }
    ]
},
    { timestamps: true }
);

const Lesson = mongoose.model('lessons', LessonsSchema);
module.exports = Lesson;