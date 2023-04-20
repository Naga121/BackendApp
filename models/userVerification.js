const  mongoose = require("mongoose");

const UserVerification =new  mongoose.Schema({
    userId:{ 
        type:String
    },
    uniqueString:{
        type:String,
        unique:true,
    },
    createdAt:{
        type:Date,
         
    },
    expiresAt:{
        type:Date,
         
    },

});
const userVerification=mongoose.model('userVerification',UserVerification)
module.exports =userVerification;
