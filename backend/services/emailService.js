const nodemailer = require('nodemailer');
require('dotenv').config({ path: './services/OTP_host_email_config.env' });
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOTP(email, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for verification',
            text: `Your OTP is: ${otp}. Valid for 5 minutes.`
        };
        
        return await this.transporter.sendMail(mailOptions);
    }
}
module.exports = new EmailService();
