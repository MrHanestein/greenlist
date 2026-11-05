import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { getStripe } from './stripe';
import { del } from '@vercel/blob';
type Services={cancelSubscriptions:(customerId:string)=>Promise<void>;deleteIdentity:(clerkId:string)=>Promise<void>};
const services:Services={
 async cancelSubscriptions(customerId){const stripe=getStripe();const subs=await stripe.subscriptions.list({customer:customerId,status:'all',limit:100});for(const sub of subs.data)if(!['canceled','incomplete_expired'].includes(sub.status))await stripe.subscriptions.cancel(sub.id);},
 async deleteIdentity(clerkId){try{await (await clerkClient()).users.deleteUser(clerkId);}catch(e){if((e as {status?:number}).status!==404)throw e;}}
};
export async function deleteAccount(userId:string,deps:Services=services){
 const user=await prisma.user.findUnique({where:{id:userId}});if(!user)return;
 await prisma.user.update({where:{id:userId},data:{deletingAt:user.deletingAt??new Date(),extensionVersion:{increment:1}}});
 if(user.stripeCustomerId)await deps.cancelSubscriptions(user.stripeCustomerId);
 const documents=await prisma.cvProfile.findMany({where:{userId,rawFileUrl:{not:null}}});
 for(const doc of documents)if(doc.rawFileUrl?.startsWith('cv/'+userId+'/'))await del(doc.rawFileUrl);
 await deps.deleteIdentity(user.clerkId);
 await prisma.user.delete({where:{id:userId}});
}
export async function retryDeletions(){
 const pending=await prisma.user.findMany({where:{deletingAt:{not:null}},take:100});
 let completed=0;
 for(const u of pending){try{await deleteAccount(u.id);completed++;}catch{await prisma.syncRun.create({data:{kind:'account-deletion',status:'FAILED',message:'Pending deletion requires retry; no personal data logged'}});}}
 return completed;
}
