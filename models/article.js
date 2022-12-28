const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const ArticleSchema = new Schema ({
    userID: String,
    content: String,
    imgUrl: [
    ],
    comments: [
    ],    
    reactions: [

    ],
},
    { timestamps: true }
);

const Article = mongoose.model('article', ArticleSchema);
module.exports = Article;