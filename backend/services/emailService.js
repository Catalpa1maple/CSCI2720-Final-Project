const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'csci2720host@gmail.com',
                pass: 'fqzi tdqk fjiu vhbn'
            }
        });
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOTP(email, otp) {
        const mailOptions = {
            from: 'csci2720host@gmail.com',
            to: email,
            subject: 'Your OTP for verification',
            text: `Your OTP is: ${otp}. Valid for 5 minutes.`
        };
        
        return await this.transporter.sendMail(mailOptions);
    }
}

module.exports = new EmailService();
