require("dotenv").config();
const mongoose = require('mongoose');
const URI = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.l8ecb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

module.exports = connectDB = async () => {
    try {
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connecting to DB successfully');
    } catch(e) {
        console.log('ERROR' , e);
    }
}


