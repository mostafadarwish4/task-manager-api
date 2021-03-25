const express=require('express')
require('./db/mongoose')
const app=express()
const userRouter=require('./routes/users')
const taskRouter=require('./routes/tasks')
const port=process.env.PORT

//this middleware function will be excuted at every path request to the app('/',"/users","/users/..",etc..)
// app.use(requireAuth)

// parse any incoming json data to js 
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.listen(port,()=>{
    console.log('Server is up on '+port)
})
