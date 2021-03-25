const express=require('express')
const Task=require('../models/task')
const requireAuth=require('../middlewares/requireAuth')
const router =new express.Router()


router.get('/tasks/:id',requireAuth,(req,res)=>{
    const _id=req.params.id
    
    // mongoose will conver _id (string) to an ObjectID for us automatically but _id shoud be 12 bit(length of ObjectID)
    Task.findOne({_id,owner:req.user._id}).then(task=>{
        if(!task){
            return res.status(404).send()
        }
        res.status(201).send(task)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})
router.get('/tasks',requireAuth,async(req,res)=>{
    const match={}
    const sort={}
    try{
        if(req.query.completed){
            //query's properties vlues ara string
            match.completed=req.query.completed==="true"
        }
        
        if(req.query.sortBy){
            const parts=req.query.sortBy.split(':')
            sort[parts[0]]=parts[1]==='desc' ? -1:1
        }
        //const tasks=await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        if(!req.user.tasks){
            return res.send('No Tasks Yet')
        }
        res.status(201).send(req.user.tasks)
    }catch(e){
        console.log(e)
        res.status(500).send('Try again Later')
    }
})
router.post('/tasks',requireAuth,(req,res)=>{
     const updates=Object.keys(req.body)
     const allowedUpdates=['description','completed']
     const isValidOperation=updates.every(item=>allowedUpdates.includes(item))
     if(!isValidOperation){
         return res.status(400).send('Invalid updates')
     }
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })
    task.save().then(()=>{
        res.send(task)
    }).catch((e)=>{
        res.status(400).send(e)
    })
 })
router.delete('/tasks/:id',requireAuth,async(req,res)=>{
    try {
        const task=await Task.findOneAndDelete({owner:req.user._id,_id:req.params.id})
        if(!task){
            return res.status(404).send('The task what you try to delete is not exist')
        }
        res.send(task)        
    } catch (e) {
        res.send(500).send('Try Again Later')
    }
})
router.patch('/tasks/:id',requireAuth,async(req,res)=>{
     const updates=Object.keys(req.body)
     const allowedUpdates=['description','completed']
     const isValidOperation=updates.every(item=>allowedUpdates.includes(item))
     if(!isValidOperation){
         return res.status(400).send('Invalid updates')
     }
     try {
        const task =await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send('This task is not found')
        } 
        updates.forEach(update=>task[update]=req.body[update])
        await task.save()
        res.send(task)
     } catch (error) {
            res.status(400).send(error)       
     }
 })

 module.exports=router