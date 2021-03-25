const sgMail=require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMSG=(email,name)=>{
    sgMail.send({
    to:email,
    from:'mostafa.darweech@gmail.com',
    subject:'Thanks for joining our app.',
    text:`Welcome to the app,${name}.`
})
}
const sendCancelationMSG=(email,name)=>{
    sgMail.send({
    to:email,
    from:'mostafa.darweech@gmail.com',
    subject:'Sorry to see you go.',
    text:`GoodBye,${name}.Hope you comeback soon.`
    })
}
module.exports={
    sendWelcomeMSG,
    sendCancelationMSG
}
//mostafa123456789