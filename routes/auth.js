const express=require('express');
const res = require('express/lib/response');
const authController=require('./../controllers/auth')



const router=express.Router();


router.post('/register',authController.register,(req,res)=>{
    res.redirect('/otp')
})
router.post('/otp',authController.otp,(req,res)=>{
    if(req.user){

        res.redirect('/welcome')
    }else{
        res.redirect('/')
    }
})
router.post('/login',authController.login,(req,res)=>{
    res.redirect('/welcome')
})

router.get('/logout',authController.logout)

router.get('/delete',authController.delete)

router.post('/update',authController.update,(req,res)=>{
    if(req.user){
        res.redirect('/welcome')
    }else{
        res.redirect('/login')
    }
})


module.exports=router