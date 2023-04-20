const multer=require('multer');

// Uploade file stuff
const storage =multer.diskStorage({  
    //cb means Callback
    destination:function(req,file,cb){cb(null, './uploads/') },
    filename:function(req,file,cb){ cb(null,new Date().toISOString()+file.originalname) }
});
const fileFilter=(req,file,cb)=>{
    // reject a file
    (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') ? cb(null,true) : cb(null,false);
}
const uploads=multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*5
    },
    fileFilter:fileFilter
});

module.exports= uploads;