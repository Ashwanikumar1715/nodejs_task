const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const crypto = require('crypto');;
const jwt = require('jsonwebtoken'); 
const nodemailer=require('nodemailer')


// Register User
 exports.registerUser = asyncErrorHandler( async (req, res, next) => {

const { name, email, password} = req.body;
    
 User.create({
        name,
        email,
        password
       
    })
    .then(user => {
        res.status(200).json({ user });
      })
      .catch(error => {
        console.error('Error creating user:', error);
        // Error handling and response sending can be done here
        res.status(500).json({ message: 'Error creating user' });
      });
        
})

    // Login User
    exports.loginUser =asyncErrorHandler (async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            next(new ErrorHandler("Please Enter Email And Password", 400));
            return; 
        }
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            console.log(email,password)
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }
        
       sendToken(user, 200, res); 
        
    });



// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });
//${req.protocol}://${req.get("host")}
const resetPasswordUrl = `http://localhost:4000/password/reset/${resetToken}`;
   

    

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: user.email,
            subject: 'Password Reset', 
            text: `Your password reset token is: ${resetPasswordUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});


