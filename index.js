require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-subscription', async (req, res) => {
  const { email, priceId } = req.body;

  try {
    // Create customer
    const customer = await stripe.customers.create({ email });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

    res.send({
      clientSecret,
      customerId: customer.id,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    res.status(400).send({ error: { message: error.message } });
  }
});

  

app.listen(3000, () => console.log('Server running on port 3000'));
