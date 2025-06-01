
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end("Only POST allowed");
  }

  const { price, carId, stripeAccountId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sek',
            unit_amount: price * 100,
            product_data: {
              name: `Bokning av bil ${carId}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: Math.floor(price * 0.1 * 100),
        transfer_data: {
          destination: stripeAccountId,
        },
      },
      success_url: 'https://dinwebbplats.vercel.app/success.html',
      cancel_url: 'https://dinwebbplats.vercel.app/cancel.html',
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Något gick fel med Stripe' });
  }
}
