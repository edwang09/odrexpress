import nextConnect from 'next-connect';
import database from './database';
const crypto = require('crypto');
const handler = nextConnect();
const salt = "rustylake"
handler.use(database);
const stripe = require("stripe")("sk_test_pee3vhbLXgnd5OclFkzrThTO00ziDEf9KW");


const calculateOrderAmount = items => {
    return 100;
};

handler.post(async (req, res) => {
    const { items } = req.body;
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd"
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

export default handler;