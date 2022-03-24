const nodemailer=require('nodemailer')

var helpers={}


helpers.generateOTP=function(){
    var possibleChar='ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var str=''
    for(var i=0;i<4;i++){
        var randomStr=possibleChar.charAt(Math.floor(Math.random()*possibleChar.length))
        str+=randomStr
    }
    return str;
}

helpers.sendEmail=function(otp,email,name){
    var transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'Your email id',
            pass:'your password'
        }
    })
    var mailOptions={
        from:'your email id',
        to:email,
        subject:'Verification Code',
        text:'Hi! '+name+' your Verification Code is '+otp
    }
    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            console.log(err)
        }else{
            console.log('Email Send To : '+email)
        }
    })
}



module.exports=helpers