const  mongoose = require("mongoose");

const Product=new  mongoose.Schema({ 
    _id:mongoose.Schema.Types.ObjectId,
    name:{ 
        type:String,
        required:true 
    },
    price:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required: true
    },
    productImage:{
        type:String,
        required: true
    },
});
const product=mongoose.model('products',Product);
module.exports=product;