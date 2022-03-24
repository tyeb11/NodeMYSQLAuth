const express=require('express');
const authController=require('./../controllers/auth')



const router=express.Router();




router.get('/',(req,res)=>{
    if(req.cookies.owt){
        res.clearCookie('owt')
    }
    res.render('register')
})

router.get('/login',(req,res)=>{
    res.render('login')
})

router.get('/welcome',authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.render('welcome',{
            user:req.user
        })

    }else{
        res.redirect('/')
    }
})

router.get('/otp',(req,res)=>{
    if(req.cookies.owt){

        res.render('otp')
    }else{
        res.redirect('/')
    }
})




module.exports=router;