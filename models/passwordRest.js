const  mongoose = require("mongoose");

const PasswordReset =new  mongoose.Schema({
    userId:{ 
        type:String
    },
    resetString:{
        type:Date,
        unique:true,
    },
    createdAt:{
        type:Date,
         
    },
    expiresAt:{
        type:Date,
    },

});
const passwordReset=mongoose.model('passwordReset',PasswordReset)
module.exports =passwordReset;
