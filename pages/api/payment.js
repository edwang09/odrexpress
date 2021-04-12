import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
handler.use(database);
const stripe = require("stripe")(process.env.STRIPE_SK);


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