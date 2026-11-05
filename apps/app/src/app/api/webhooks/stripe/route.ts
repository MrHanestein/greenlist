import { NextResponse } from 'next/server';
import { getStripe,syncSubscription } from '@/lib/stripe';
import type Stripe from 'stripe';
export async function POST(req:Request){
 const signature=req.headers.get('stripe-signature');
 if(!signature || !process.env.STRIPE_WEBHOOK_SECRET)return NextResponse.json({error:'Signature required'},{status:400});
 let event:Stripe.Event;
 try{event=getStripe().webhooks.constructEvent(await req.text(),signature,process.env.STRIPE_WEBHOOK_SECRET);}catch{return NextResponse.json({error:'Invalid signature'},{status:400});}
 try{
  if(event.type==='checkout.session.completed'){const session=event.data.object as Stripe.Checkout.Session;if(session.subscription)await syncSubscription(typeof session.subscription==='string'?session.subscription:session.subscription.id);}
  else if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type))await syncSubscription((event.data.object as Stripe.Subscription).id);
  return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:'Subscription sync failed; retry required'},{status:500});}
}