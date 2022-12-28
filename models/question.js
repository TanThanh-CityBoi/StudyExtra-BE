const { ObjectId } = require('mongodb');
const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const QuestionsSchema = new Schema({
    ListQuestions: Array
},
    {timestamps: true}
);

const Questions = mongoose.model('questions', QuestionsSchema);

module.exports =  Questions;