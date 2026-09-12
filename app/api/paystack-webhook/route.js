import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const customerEmail = event.data && event.data.customer ? event.data.customer.email : null;

      if (customerEmail) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('email', customerEmail);

        if (updateError) {
          console.error('Failed to upgrade user: ' + updateError.message);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed: ' + error.message }, { status: 500 });
  }
}