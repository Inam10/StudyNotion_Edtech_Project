const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL ,{
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("DB Connect Successfully"))
    .catch((error)=>{
        console.log("Db Connection Failed");
        console.error(error);
        process.exit(1);
    })
}