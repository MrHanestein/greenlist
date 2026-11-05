import { endpoint } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { shortlist } from '@/lib/shortlist';
import { isPlus,packLimit,packPeriod } from '@/lib/domain';
export const GET=endpoint(async()=>{
 const user=await requireUser();const plus=isPlus(user);
 const [jobs,facts,applications,notifications,usage,packs,sync]=await Promise.all([
 shortlist(user),prisma.approvedFact.findMany({where:{userId:user.id},orderBy:{updatedAt:'desc'}}),
 prisma.application.findMany({where:{userId:user.id},include:{versions:{orderBy:{createdAt:'desc'},take:5}},orderBy:{updatedAt:'desc'},take:200}),
 prisma.notification.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'},take:10}),
 prisma.usage.findUnique({where:{userId_period_kind:{userId:user.id,period:packPeriod(plus,new Date(),user.subscriptionPeriodStart),kind:'PACK'}}}),
 prisma.applicationPack.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'},take:40}),
 prisma.syncRun.findFirst({where:{kind:'jobs'},orderBy:{createdAt:'desc'}})]);
 return {user:{...user,stripeCustomerId:undefined,stripeSubscriptionId:undefined},plus,jobs,facts,applications,notifications,packs,usage:{used:usage?.count ?? 0,limit:packLimit(plus),resetsAt:plus?user.subscriptionValidUntil:null},sync};
});