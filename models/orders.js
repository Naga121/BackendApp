const  mongoose = require("mongoose");

const Orders=new  mongoose.Schema({ 
    _id:mongoose.Schema.Types.ObjectId,
    product:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
        required:true 
    },
    quantity:{
        type:Number,
        default:1
    },
   
});
const orders=mongoose.model('orders',Orders);
module.exports=orders;