require('dotenv').config();
const mongooes=require('mongoose');
mongooes.connect(process.env.MONGODB_URI,{useUnifiedTopology:true,useNewUrlParser:true}).then( ()=>{
    console.log("DB Connected...");
}).catch(err=>{
    console.log(err);
});