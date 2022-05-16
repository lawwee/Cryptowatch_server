const cronJob = require('cron').CronJob;

const currentPrice = require('../util/currentprice');
const sendEmail = require('../util/sendmail');
const Alert = require('../models/alert');

var sendAlert = new cronJob("*/30 * * * *",
    async function () {
        const currentPrices = await currentPrice();
        if (currentPrices.error) {
            return error;
        }
        const coinId = currentPrices.coinInfo[0]
        let priceObj = {
            coinId: currentPrices.currentPrice
        };
        Alert.forEach((alert, index) => {
            if (
                alert.alertType == "HIGH" &&
                parseFloat(alert.price) <= parseFloat(priceObj.alert[coinId])
            ) {
                sendEmail({
                    to: alert.email,
                    subject: `${alert.coinId} is up!!`,
                    html: `Price of ${alert.coinId} has just exceeded your alert price of ${alert.price} USD.
                    Current price is ${priceObj[alert.coinId]} USD.`
                })
                Alert.splice(index,1)
            } else if (
                alert.alertType == "LOW" &&
                parseFloat(alert.price) <= parseFloat(priceObj.alert[coinId])
            ) {
                sendEmail({
                    to: alert.email,
                    subject: `${alert.coinId} is down!!`,
                    html: `Price of ${alert.coinId} fell below your alert price of ${alert.price} USD.
                    Current price is ${priceObj[alert.coinId]} USD.`
                })
                Alert.splice(index,1)
            }
        })
    })

sendAlert.start();
// exports.addAlert = async (req, res, next) => {
//     coinId = req.params.coin;
//     const cprice = await currentPrice();
//     console.log(cprice);
    
// }