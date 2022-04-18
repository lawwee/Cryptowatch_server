const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerconfig');

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport(nodemailerConfig)

    const mailOptions = {
        from: 'Cryptowatch@domain.com',
        to,
        subject,
        html
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    })
};

module.exports = sendEmail;