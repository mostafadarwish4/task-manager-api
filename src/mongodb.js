const{MongoClient,ObjectID}=require('mongodb')

const connectionUrl='mongodb://127.0.0.1:27017'
const databaseName='task-manager'

MongoClient.connect(connectionUrl,
    {useNewUrlParser:true,
     useUnifiedTopology: true},
    (error,client)=>{
    if(error){
        return console.log('Unable to connect to your database')
    }
    //create our database on server if does not exist and manipulte with it 
    const db=client.db(databaseName)
   
})