const jwt=require('jsonwebtoken')
const User=require('../models/user')

module.exports=async(req,res,next)=>{
    try {
        const token=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(token,process.env.JWT_SECET)
        const user=await User.findOne({_id:decoded._id})
        if(!user){
            throw new Error()
        }
        // by tht we will add a property to req 
        //(req.user here will have the same user of mongo and can operate all oprations(save(),..) like the other)
        req.user=user
        req.token=token
        next()
    } catch (e) {
        res.status(401).send('Please authenicate.')
    }
}