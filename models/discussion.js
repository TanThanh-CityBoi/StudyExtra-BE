const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const DicussionSchema = new Schema ({
    lessonID: String,
    comments: [
    ],    
    reactions: [

    ],
},
    { timestamps: true }
);

const Dicussion = mongoose.model('discussion', DicussionSchema);
module.exports = Dicussion;