const jwt=require('jsonwebtoken');
const secretKey='jwtSecret';

module.exports=(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(' ')[1]; 
        const decoded = jwt.verify(token,secretKey,{exports: '1h'});
        req.useData = decoded
        next();
    } catch (error) {
        return res.status(401).json({message : 'Authorization token faild..'})
    }
};

