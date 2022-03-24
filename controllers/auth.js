const mysql=require('mysql');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const {promisify}=require('util');
const async = require('hbs/lib/async');
const nodemailer=require('nodemailer')
const helpers=require('./../helpers/helpers');
const { nextTick } = require('process');
const { route } = require('../routes/pages');
const { cookie } = require('express/lib/response');

const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
})


var auth={}

auth.register=(req,res,next)=>{

    const {name,email,password,passwordConfirm}=req.body;
    if(name&&email&&password&&passwordConfirm){

    
    db.query('SELECT email FROM users WHERE email = ?',[email],async(err,data)=>{
        if(err){
            console.log(err)
        }
        if(data.length>0){
            return res.render('register',{
                message:'This Email Already Exists'
            })
        }
        if(password!=passwordConfirm){
            return res.render('register',{
                message:'Password does not match'
            })
        }
        var otp=helpers.generateOTP()
        let hashedPassword=await bcrypt.hash(password,10);
        db.query('INSERT INTO users SET ?',{name:name,email:email,password:hashedPassword,otp:otp},(err,data)=>{
            if(err){
                console.log(err)
            }else{
                 //to be continue
                console.log('DONE!')
                helpers.sendEmail(otp,email,name);
                const token=jwt.sign({id:email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
                const cookieOption={
                    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
                    httpOnly:true
                }
                res.cookie('owt',token,cookieOption)
                return next() 
            }
        })
    })
}else{
    return res.render('register',{
        message:'Please Fill all Inputs'
    }) 
}
}


auth.login= async (req,res,next)=>{
    try{
        const {email,password}=req.body;
        if(!email||!password){
            
            return res.status(400).render('login',{
                message:'Please Provide Email and Password'
            })
        }
        db.query('SELECT * FROM users WHERE email = ?',[email],async(err,data)=>{
            if(data.length<1){
                return res.status(401).render('login',{
                    message:'Account does not Exists'
                })
            }else{
                if(!(await bcrypt.compare(password,data[0].password))){
                    return res.status(401).render('login',{
                        message:'Email or Password not Valid'
                    })
                }
                const id=data[0].id;
                const token=jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
                const cookieOption={
                    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
                    httpOnly:true
                }
                res.cookie('jwt',token,cookieOption)
                return next()
            }
        })
    }catch(e){
        console.log(e)
    }
}

auth.isLoggedIn=async (req,res,next)=>{
    if(req.cookies.jwt){
        try{
            const decode=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
            db.query('SELECT * FROM users WHERE id =?',[decode.id],(err,data)=>{
                if(!data){
                    return next()
                }
                req.user=data[0]
                console.log(req.user)
                return next()
            })
        }catch(e){
            return next()
        }
    }else{
        return next()
    }
}


auth.otp=async(req,res,next)=>{
    const {otp}=req.body;
    if(otp){

    
    if(req.cookies.owt){
        try{
            const decode=await promisify(jwt.verify)(req.cookies.owt,process.env.JWT_SECRET);
            db.query('SELECT * FROM users WHERE email = ?',[decode.id],(err,data)=>{
                if(!data){
                    
                }
                if(otp!=data[0].otp){
                    return res.status(400).render('otp',{
                        message:'Wrong OTP'
                    })
                }
                req.user=data[0]
                res.clearCookie('owt')
                const id=data[0].id;
                const token=jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
                const cookieOption={
                    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
                    httpOnly:true
                }
                res.cookie('jwt',token,cookieOption)
                return next()
            })
        }catch(e){
            return next()
        }
    }else{
        return res.status(400).render('otp',{
            message:'Sorry :('
        })
    }
}else{
    return res.status(400).render('otp',{
        message:'Please Provide OTP'
    })
}
}


auth.logout=async(req,res)=>{
    res.clearCookie('jwt')
    res.status(200).redirect('/login')
}
auth.delete=async(req,res)=>{
    if(req.cookies.jwt){
        try{
            const decoder=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
            db.query('DELETE FROM users WHERE id = ?',[decoder.id],(err,data)=>{
                if(!err){
                    res.clearCookie('jwt')
                    res.status(200).redirect('/')
                }else{
                    console.log(err)
                }
            })
        }catch(e){

        }
    }
}


auth.update=async(req,res,next)=>{
    var {name,email,password}=req.body;
    const decode=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
    console.log(name)
    if(name){
        db.query('UPDATE users SET name = ? WHERE id = ?',[name,decode.id],(err,data)=>{
            if(err){
                console.log(err)
            }else{
                db.query('SELECT * FROM users WHERE id = ?',[decode.id],(err,data)=>{
                    if(data){
                        req.user=data[0];
                        return next();
                    }
                })
            }
            
        })
    }
    
  
}




module.exports=auth;