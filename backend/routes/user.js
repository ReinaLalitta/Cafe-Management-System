const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/signup', (req, res) => {
    let user = req.body;
    let query = "SELECT email, password, role, status FROM user WHERE email=?";
    
    connection.query(query, [user.email], (err, results) => {
        if (err) {
            return res.status(500).json(err); // Handle database error
        }
        
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        } else {
            // Logic to handle user registration
            // For example, inserting a new user into the database
            let insertQuery = "INSERT INTO user (name, email, password, status, role) VALUES (?, ?, ?, ?, ?)";
            let values = [user.name, user.email, user.password, user.status, user.role]; // Assuming these fields come from req.body
            
            connection.query(insertQuery, values, (insertErr, insertResults) => {
                if (insertErr) {
                    return res.status(500).json(insertErr); // Handle insert error
                }
                
                return res.status(200).json({ message: 'User registered successfully' });
            });
        }
    });
});

router.post('/login',(req,res) => {
    const user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length <=0 || results[0].password !=user.password){
                return res.status(401).json({message:"Incorect Username or password"});
            }
            else if(results[0].status === 'false'){
                return res.status(401).json({message:"Wait for Admin Approval"});
            }
            else if(results[0].password == user.password){
                const response = { email: results[0].email, role: results[0].role}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'8h'})
                res.status(200).json({token:accessToken});
            }
            else{
                return res.status(400).json({message:"Something went wrong.Please try again later"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })

})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    }
})

router.post('/forgotPassword',(req,res)=>{
    const user = req.body;
    query = "select email,password from user where email=?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length <= 0)
                {
                    return res.status(200).json({message: "Password sent successfully to your email."});
                }
                else{
                    var mailOptions = {
                        from: process.env.EMAIL,
                        to: results[0].email,
                        subject: 'Password by Cafe Management System',
                        html: '<p><b>Your Login Details For Cafe Management Systems</b><br><b>Email: </b>'+results[0].email+'<br><b>Password: </b>'+results[0].password+'<br><a href="http://localhost:4200">Click here to login</a></p>'
                    };
                    transporter.sendMail(mailOptions,function(error,info){
                        if(error){
                            console.log(error);
                        }
                        else{
                            console.log('Email sent: '+info.response);
                        }
                    });
                    return res.status(200).json({message: "Password sent successfully to your email."});
                }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.get('/get',(req,res)=>{
    var query ="select id,name,email,contactNumber,status from user where role='user'";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.patch('/update',(req,res)=>{
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query,[user.status,user.id],(err,results)=>{
        if(!err){
            if(res.affectedRows == 0){
                return res.status(404).json({message:"User id does not exist"});
            }
            return res.status(200).json({message:"User Updated Successfully"});  
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.get('/checkToken',(req,res)=>{
    return res.status(200).json({message:"true"});  
})

router.post('/changePassword',(req,res)=>{
    const user = req.body;
})

module.exports = router;