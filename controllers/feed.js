const fetch = require('node-fetch');

exports.allCoins = async (req, res, next) => {
    // const currentPage = req.query.page || 1;
    // const perPage = 50;
    const COINS_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false'
    const response = await fetch(COINS_URL);
    const data = await response.json();
    let fetched_data = data;
    // console.log(plus);
    const coins = fetched_data.map(({ id, symbol, name, current_price, market_cap  }) => {
        return { id, symbol, name, current_price, market_cap }
    })
    // console.log(help);
    res.status(200).json({ message: 'Fetched all Coins', coins: coins })
};

exports.oneCoin = async (req, res, next) => {
    const coinId = req.params.coin;
    try {
        const COIN_URL = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        const result = await fetch(COIN_URL);
        const data = await result.json();
        const singleCoin = ({ id, symbol, name, market_data }) =>{
            id = id,
            symbol = symbol,
            name = name
            price = market_data.current_price.usd
            market_cap = market_data.market_cap.usd
            return { id, symbol, name, price, market_cap }
        };
        const one_coin = singleCoin(data);
        // console.log(bust);
        res.status(200).json({ message: 'Coin Retrieved', coinData: one_coin })
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};