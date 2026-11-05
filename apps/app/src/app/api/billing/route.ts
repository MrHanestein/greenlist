import { endpoint,body,HttpError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import {aiConfig} from '@/lib/preparation';
import { z } from 'zod';
export const POST=endpoint(async req=>{
 const user=await requireUser();const {action}=await body(req,z.object({action:z.enum(['checkout','portal'])}));
 if(!process.env.STRIPE_SECRET_KEY || !process.env.APP_URL)throw new HttpError(503,'Subscriptions are not open yet. You can continue using Free.');
 const stripe=getStripe();const appUrl=process.env.APP_URL;
 let customer=user.stripeCustomerId;
 // Managing existing billing must never depend on whether a price is still on sale.
 if(action==='portal' || user.stripeSubscriptionId){
  if(!customer)throw new HttpError(404,'No billing account is connected to this account.');
  const session=await stripe.billingPortal.sessions.create({customer,return_url:appUrl+'/dashboard?tab=account'});return {url:session.url};
 }
 if(!process.env.STRIPE_PRICE_PLUS || process.env.PAID_PILOT_ENABLED!=='true')throw new HttpError(503,'The paid pilot is not open yet. You can continue using Free.');
 if(!process.env.BUSINESS_NAME||!process.env.BUSINESS_ADDRESS||!process.env.SUPPORT_EMAIL)throw new HttpError(503,'The paid pilot is awaiting operator and support setup.');
 if(process.env.BUSINESS_MODEL_REVIEWED!=='true')throw new HttpError(503,'The preparation pilot is awaiting business-model review. Free remains available.');
 aiConfig();
 const price=await stripe.prices.retrieve(process.env.STRIPE_PRICE_PLUS);
 if(price.currency!=='gbp'||price.unit_amount!==1500||price.recurring?.interval!=='month'||price.recurring.interval_count!==1||!price.active)throw new HttpError(503,'The Plus price is not configured correctly. No payment has been taken.');
 if(!customer){const created=await stripe.customers.create({email:user.email,metadata:{userId:user.id}},{idempotencyKey:'customer:'+user.id});customer=created.id;await prisma.user.update({where:{id:user.id},data:{stripeCustomerId:customer}});}
 const active=await stripe.subscriptions.list({customer,status:'all',limit:100});
 if(active.data.some(s=>!['canceled','incomplete_expired'].includes(s.status))){const session=await stripe.billingPortal.sessions.create({customer,return_url:appUrl+'/dashboard?tab=account'});return {url:session.url};}
 const session=await stripe.checkout.sessions.create({customer,mode:'subscription',line_items:[{price:process.env.STRIPE_PRICE_PLUS,quantity:1}],success_url:appUrl+'/dashboard?billing=success',cancel_url:appUrl+'/dashboard?tab=account',client_reference_id:user.id,subscription_data:{metadata:{userId:user.id}}},{idempotencyKey:'checkout:'+user.id+':'+Math.floor(Date.now()/1800000)});
 return {url:session.url};
});
