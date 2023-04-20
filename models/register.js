const  mongoose = require("mongoose");

const User =new  mongoose.Schema({
    _id:{ 
        type:mongoose.Schema.Types.ObjectId 
    },
    username:{ 
        type:String,
        required:true,
        allowNull:false
    },
    fullName:{ 
        type:String,
        required:true,
        allowNull:false
    },
    dateOfBirth:{
        type:Date,
        required:true ,
        allowNull:false
    },
    profilePic:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true, 
        index:true, 
        unique:true,
    },
    password:{
        type:String,
        required:true,
        allowNull:false, 
    },
    confirmpassword:{
        type:String,
        required:false,
        allowNull:false, 
    },
    active:{
        type:Boolean
    },
    verified:{
        type:Boolean
    }

});
const user=mongoose.model('user',User)
module.exports =user;
