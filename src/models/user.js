const mongoose=require('mongoose')
const validator = require('validator')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const Task = require('../models/task')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    email:{
        type:String,
        required:true,
        // to not cascade emails
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Enter a valid email')
            }
        }
    },
    password:{
        type:String,
        minLength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not have word "password"')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})
//create a virtual property(will not exist in DB) that used as a link between two models
userSchema.virtual('tasks',{
    ref:'Task',
    localField:"_id",
    foreignField:"owner"
})
// create an instance method
//it will define will be showed to the public(when it fetched from any outside (it will out in shape of JSON))
userSchema.methods.toJSON=function(){
    const user = this
    //toObject to trate instance of user object as normal object and can be done oprations of normal objects on it like delete
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
userSchema.methods.getAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id},'secret_key')
    user.tokens.push({token})
    await user.save()
    return token
}
//create a method for model
userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
            throw new Error('Unable to login')
    }
    return user
}
userSchema.pre('save',async function(next){
    const user=this
     if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
        }
     next()
})
//delete user tasks befor deteing itself
userSchema.pre('remove',async function(req,res,next){
    const {_id}=this
    await Task.deleteMany({owner:_id})
    next()
})
//create model
const User=mongoose.model('User',userSchema)

module.exports=User