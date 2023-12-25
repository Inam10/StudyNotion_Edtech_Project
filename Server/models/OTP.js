const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true
    },
    createdAt: {
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
})

////function for send email

async function sendVerificationEmail (email , otp){
    try {
        const mailResposnse = await mailSender(email,"Verification email from studyNotion" , otp);
        console.log("Email send successfully" , mailResposnse);
    } catch (error) {
        console.log("Error occured while sending mail " , error);
        throw error;
    }
}

///premiddleware
OTPSchema.pre("save" , async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP" , OTPSchema)

 