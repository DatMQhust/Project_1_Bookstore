const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI;
module.exports.connect = async ()=>{
    try{
        await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Database connected');
    }
    catch(err){
        console.log('Database connect failed');
        console.log(err);
    }
}