const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @param {import('vercel').VercelRequest} req
 * @param {import('vercel').VercelResponse} res
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Endast POST är tillåtet' });
  }

  try {
    const { carId, price, stripe_account_id } = req.body;

    if (!carId || !price || !stripe_account_id) {
      return res.status(400).json({ error: 'Saknar carId, pris eller stripe_account_id' });
    }

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
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
      payment_intent_data: {
        application_fee_amount: Math.round(price * 100 * 0.1), // 10% avgift
        transfer_data: {
          destination: stripe_account_id,
        },
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: 'Ett serverfel inträffade. Försök igen senare.' });
  }
};
