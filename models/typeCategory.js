const mongoose = require ('mongoose')
const Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const typeCategorySchema = new Schema ({
    _id: ObjectId,
    name: String,   
},
    { timestamps: true }
);

const typeCategory = mongoose.model('typeCategory', typeCategorySchema);
module.exports = typeCategory ;