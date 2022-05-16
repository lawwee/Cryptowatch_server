module.exports = {
    service: `${process.env.NODEMAIL_SERVICE}`,
    auth: {
        user: `${process.env.NODEMAIL_USERNAME}`,
        pass: `${process.env.NODEMAIL_PASSWORD}`
    },
};