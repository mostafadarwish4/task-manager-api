const express=require('express')
const User=require('../models/user')
const requireAuth=require('../middlewares/requireAuth')
const router=new express.Router()
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeMSG,sendCancelationMSG}=require('../emails/account')
router.post('/users/signup',async(req,res)=>{
    try {
        const user=new User(req.body)
        sendWelcomeMSG(user.email,user.name)
        const token=await user.getAuthToken()
        await user.save()
        res.send({user,token})
    } catch (e) {
        res.status(404).send(e.message)
    }
    
})
router.post('/users/login',async(req,res)=>{
    try {
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token =await user.getAuthToken()
        res.send({user,token})
    } catch (e){
        res.status(404).send(e.message)
    }
    
})

// here will put requireAuth so we make sure that no one can get to our app without authenication
router.post('/users/logout',requireAuth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter(item=>item.token!==req.token)
        req.token=''
        req.user=null
        res.send({user:req.user,token:req.token})
    } catch (e) {
        res.status(500).send(e)
    }
})
router.post('/users/logoutAll',requireAuth,async(req,res)=>{
    try {
        req.user.tokens=[]
        req.token=''
        await req.user.save()  
        res.send(req.user)      
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})
router.get('/users/me',requireAuth,(req,res)=>{
    res.send(req.user)
})
router.patch('/users/me',requireAuth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','age','password','email']
    const isValidOperation=updates.every(item=>allowedUpdates.includes(item))
    if(!isValidOperation){
        return res.status(400).send('Invalid updates')
    }
    try {
        updates.forEach(update=>req.user[update]=req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.post('/users',(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','age','password','email']
    const isValidOperation=updates.every(item=>allowedUpdates.includes(item))
    if(!isValidOperation){
        return res.status(400).send('Invalid updates')
    }
    const user=new User(req.body)
    user.save().then(()=>{
        res.send(user)
    }).catch((e)=>{
        res.status(400).send(e)
    })
 })
 
 router.get('/users/:id',(req,res)=>{
     const _id=req.params.id
     
     // mongoose will convert _id (string) to an ObjectID for us automatically but _id shoud be 12 bit(length of ObjectID)
     User.findById(_id).then((user)=>{
         if(!user){
            return res.status(404).send('None existing user')
        }
        res.status(201).send(user)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

router.delete('/users/me',requireAuth,async(req,res)=>{
    try {        
        await req.user.remove()
        sendCancelationMSG(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e.message)
    }
})
//create or save any uploads at images folder
const upload=multer({
   // dest:'images',
    limits:{
        fileSize:1000000,
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            //cb(error,boolen) boolen to accept the file or not
            return cb(new Error('Please upload an image'))
        }
        //if the extension is correct will
        cb(undefined,true)
    }
})
// at data-form create avatar field to your avatart pic
router.post('/users/me/avatar',requireAuth,upload.single('avatar'),async(req,res)=>{
    // sharp module used to convert large images to smaller 
    const buffer=await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    //will handle error of cb() in filefilter function orr any other errors
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',requireAuth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{ const user=await User.findById(req.params.id)
        if(!user||!user.avatar){
            throw Error()
        }
        //set the header of response to specify the type of data that we will send
        res.set('Content-Type','image/png')
        res.send(user.avatar)
        }catch(e){
            res.status(400).send()
        }
})


module.exports=router