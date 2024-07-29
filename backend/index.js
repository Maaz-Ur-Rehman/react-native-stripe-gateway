const express = require('express');
const stripe = require('stripe')('sk_test_51PfHerRoaovqOmibgD9RdEOEBBPd5qJ6GSkaAvja3JXdCGHoXfmxGaP9MocPHtyFy5SlSEC2UaQ6UpXjhO6OJXCH00mYajJuvr');
const bodyParser = require('body-parser');
const cors= require('cors');
process.env.STRIPE_SECRET_KEY
const app = express();

app.use(cors());  //enable cors for all requests
app.use(bodyParser.json());



app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(400).send({
            error: {
                message: error.message,
            },
        });
    }
});
app.post('/payment-sheet', async (req, res) => {
    // Use an existing Customer ID if this is a returning customer.

    const {amount, currency} = req.body

    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2022-08-01'}
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      payment_method_types: [ 'card'],
    });
  
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  });
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
