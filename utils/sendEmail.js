const nodemailer = require("nodemailer");

class SendEmail {
    verifyEmail = async (email, subject, text) => {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                service: process.env.SERVICE,
                port: Number(process.env.EMAIL_PORT),
                secure: Boolean(process.env.SECURE),
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS,
                },
            });
            const htmlcode = '<div style="text-align: center">'
                + '<h1 style="color: #000">StudyExtra: Xác nhận địa chỉ mail</h1>'
                + '<a href="'
                + text
                + '"> <button style="background-color: #7B68EE; border: none; color: #fff; height: 50px; width: 150px; font-size: 20px; border-radius: 5px">'
                + 'Xác nhận</button> </a></div>';

            await transporter.sendMail({
                from: process.env.USER,
                to: email,
                subject: subject,
                html: htmlcode,
            });
            console.log("email sent successfully");
        } catch (error) {
            console.log("email not sent!");
            console.log(error.toString());
            return Promise.reject(error.toString());
        }
    }

    verifyPassword = async (email, subject, text) => {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                service: process.env.SERVICE,
                port: Number(process.env.EMAIL_PORT),
                secure: Boolean(process.env.SECURE),
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.USER,
                to: email,
                subject: subject,
                text: "Verify code: " + text
            });
            console.log("email sent successfully");
        } catch (error) {
            console.log("email not sent!");
            console.log(error);
            return Promise.reject(error.toString());
        }
    }

};

module.exports = new SendEmail();