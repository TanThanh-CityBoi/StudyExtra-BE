const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const DocumentSchema = new Schema ({
    documentID: String,
    name: String,
    author: String,
    typeID: Array,
    views: Number,
    link: String,
    isHidden: Boolean,
},
    { timestamps: true }
);

const Document = mongoose.model('document', DocumentSchema);
module.exports = Document;