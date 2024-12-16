import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_IDS = {
  tier_basic: "price_1QWlhuL2LtArUNDYHQaZyjlh",    // $3.99 plan
  tier_pro: "price_1QWliIL2LtArUNDY3iyZQnWP",      // $22.70 plan
  tier_enterprise: "price_1QWlitL2LtArUNDYtRbjM6qw" // $100 plan
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    const email = user?.email;

    if (!email) {
      throw new Error('No email found');
    }

    const { tier_id } = await req.json();
    console.log('Received tier_id:', tier_id);

    const priceId = PRICE_IDS[tier_id as keyof typeof PRICE_IDS];
    if (!priceId) {
      throw new Error('Invalid subscription tier');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Creating checkout session with price ID:', priceId);
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      currency: 'usd',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscriptions?canceled=true`,
      metadata: {
        user_id: user.id,
        tier_id: tier_id,
      },
      payment_method_collection: 'always',
    });

    console.log('Checkout session created successfully:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-checkout:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.raw || error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});