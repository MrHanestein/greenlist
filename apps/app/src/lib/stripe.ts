import Stripe from 'stripe';
import {serial} from './transaction';
export function getStripe(){if(!process.env.STRIPE_SECRET_KEY)throw new Error('Stripe is not configured');return new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2025-02-24.acacia'});}
export function paidSubscription(sub:Stripe.Subscription){return ['active','trialing'].includes(sub.status)&&sub.items.data.some(i=>!!process.env.STRIPE_PRICE_PLUS&&i.price.id===process.env.STRIPE_PRICE_PLUS);}
export async function syncSubscription(subscriptionId:string,stripe:Stripe=getStripe()){
 const {prisma}=await import('./prisma');const sub=await stripe.subscriptions.retrieve(subscriptionId);
 const customer=typeof sub.customer==='string'?sub.customer:sub.customer.id;
 // Resolve current customer state rather than trusting delivery order or an old subscription's payload.
 const subscriptions=await stripe.subscriptions.list({customer,status:'all',limit:100});
 const paid=subscriptions.data.filter(paidSubscription).sort((a,b)=>b.current_period_end-a.current_period_end)[0];
 await serial(async tx=>{const previous=await tx.user.findMany({where:{stripeCustomerId:customer}});await tx.user.updateMany({where:{stripeCustomerId:customer},data:{subscriptionTier:paid?'PLUS':'FREE',stripeSubscriptionId:paid?.id ?? null,subscriptionPeriodStart:paid?.current_period_start?new Date(paid.current_period_start*1000):null,subscriptionValidUntil:paid?new Date(paid.current_period_end*1000):null}});for(const u of previous)if((u.subscriptionTier==='PLUS')!==!!paid)await tx.productEvent.create({data:{userId:u.id,kind:paid?'PAID_STARTED':'PAID_ENDED'}});});
}
