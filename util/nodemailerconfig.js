require ("dotenv").config();

module.exports = {
    // host: 'smtp@gmail.com',
    port: 465,
    secure: true,
    service: `${process.env.NODEMAIL_SERVICE}`,
    secureConnection: false,
    auth: {
        user: `${process.env.NODEMAIL_USERNAME}`,
        pass: `${process.env.NODEMAIL_PASSWORD}`
    },
};