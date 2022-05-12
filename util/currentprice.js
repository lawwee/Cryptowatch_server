const fetch = require('node-fetch');

module.exports = async (req, res) => {
    try {
        // const coinId = req.params.coin;
        const URL = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
        const resp = await fetch(URL);
        const data = await resp.json();
        let coinInfo = Object.values(data);
        const currentPrice = coinInfo[0].usd;
        return currentPrice;
    } catch (err) {
        console.log(err);
    }   
}