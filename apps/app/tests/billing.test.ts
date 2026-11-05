import test from 'node:test';
import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import { paidSubscription } from '../src/lib/stripe';
import { requireCron } from '../src/lib/http';
test('only a recognised active monthly subscription grants Plus',()=>{
 process.env.STRIPE_PRICE_PLUS='price_fixture_plus';
 const sub=(status:string,price:string)=>({status,items:{data:[{price:{id:price}}]}} as unknown as Stripe.Subscription);
 assert.equal(paidSubscription(sub('active','price_fixture_plus')),true);
 for(const state of ['canceled','unpaid','past_due','incomplete'])assert.equal(paidSubscription(sub(state,'price_fixture_plus')),false);
 assert.equal(paidSubscription(sub('active','unknown_price')),false);
 delete process.env.STRIPE_PRICE_PLUS;assert.equal(paidSubscription(sub('active','')),false);
});
test('scheduled write routes fail closed without their secret',()=>{
 delete process.env.CRON_SECRET;assert.throws(()=>requireCron(new Request('https://example.com')));
 process.env.CRON_SECRET='fixture-secret-that-is-at-least-32-characters';
 assert.throws(()=>requireCron(new Request('https://example.com',{headers:{'x-cron-secret':'wrong'}})));
 assert.doesNotThrow(()=>requireCron(new Request('https://example.com',{headers:{'x-cron-secret':process.env.CRON_SECRET!}})));
});
