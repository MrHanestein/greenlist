import { z } from 'zod';
import { endpoint,body,HttpError } from '@/lib/http';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { normaliseEmployer } from '@/lib/domain';
import { pilotMetrics } from '@/lib/cohorts';
export const GET=endpoint(async()=>{
 await requireAdmin();const since=new Date(Date.now()-28*86400000);
 const [employers,jobs,sync,events,budget,users]=await Promise.all([prisma.employer.findMany({orderBy:{reviewedAt:'desc'},take:150,include:{aliases:true}}),prisma.job.findMany({where:{OR:[{licenceStatus:'AMBIGUOUS'},{feedback:{some:{kind:'DISPUTED_EVIDENCE'}}}]},take:100}),prisma.syncRun.findMany({orderBy:{createdAt:'desc'},take:20}),prisma.productEvent.groupBy({by:['kind'],where:{createdAt:{gte:since}},_count:true}),prisma.serviceBudget.findUnique({where:{period:new Date().toISOString().slice(0,7)}}),prisma.user.count({where:{deletingAt:null}})]);
 const cohort=await prisma.user.findMany({where:{deletingAt:null,onboardedAt:{not:null}},select:{onboardedAt:true,searchStatus:true,subscriptionTier:true,subscriptionValidUntil:true,productEvents:{select:{kind:true,createdAt:true}}}});
 const latest=await prisma.sponsorSnapshot.findFirst({orderBy:{sourceDate:'desc'}});
 const candidates=latest?await prisma.sponsor.findMany({where:{snapshotId:latest.id,route:'Skilled Worker',ratingType:'Worker (A rating)',OR:['software','technology','technologies','data','digital','computing'].map(term=>({companyName:{contains:term,mode:'insensitive' as const}}))},distinct:['companyNameNorm'],select:{companyName:true,townCity:true},take:100,orderBy:{companyNameNorm:'asc'}}):[];
 return {employers,jobs,sync,events,users,metrics:pilotMetrics(cohort),candidates,aiReservedOrSpentGBP:(budget?.spentMicros??0)/1000000,setup:{accounts:!!process.env.CLERK_SECRET_KEY,billing:!!process.env.STRIPE_SECRET_KEY,ai:!!process.env.ANTHROPIC_API_KEY&&!!process.env.ANTHROPIC_MODEL,email:!!process.env.RESEND_API_KEY,paidPilot:process.env.PAID_PILOT_ENABLED==='true'}};
});
export const POST=endpoint(async req=>{
 await requireAdmin();const input=await body(req,z.object({legalName:z.string().trim().min(1).max(200),townCity:z.string().trim().min(1).max(150),website:z.string().url().startsWith('https://'),careersUrl:z.string().url().startsWith('https://'),boardProvider:z.enum(['greenhouse','lever']),boardToken:z.string().regex(/^[a-zA-Z0-9_-]+$/).max(100),alias:z.string().trim().max(200).optional(),identityEvidenceUrl:z.string().url().startsWith('https://'),permissionEvidenceUrl:z.string().url().startsWith('https://').optional(),feedApproved:z.boolean()}));
 if(input.feedApproved&&!input.permissionEvidenceUrl)throw new HttpError(400,'Record commercial-use permission evidence before enabling the feed');
 const snapshot=await prisma.sponsorSnapshot.findFirst({orderBy:{sourceDate:'desc'}});if(!snapshot)throw new HttpError(400,'Import the register first');
 const legalNameNorm=normaliseEmployer(input.legalName);
 if(!await prisma.sponsor.findFirst({where:{snapshotId:snapshot.id,companyNameNorm:legalNameNorm,townCity:{equals:input.townCity,mode:'insensitive'}}}))throw new HttpError(400,'Legal name and town must match the current register exactly');
 return prisma.$transaction(async tx=>{
  const employer=await tx.employer.upsert({where:{legalNameNorm},create:{legalName:input.legalName,legalNameNorm,townCity:input.townCity,reviewedAt:new Date()},update:{townCity:input.townCity,reviewedAt:new Date()}});
  if(input.alias){const aliasNorm=normaliseEmployer(input.alias);const old=await tx.employerAlias.findUnique({where:{aliasNorm}});if(old&&old.employerId!==employer.id)throw new HttpError(409,'That alias is already assigned to another employer');await tx.employerAlias.upsert({where:{aliasNorm},create:{aliasNorm,employerId:employer.id,evidenceUrl:input.identityEvidenceUrl,reviewedAt:new Date()},update:{evidenceUrl:input.identityEvidenceUrl,reviewedAt:new Date()}});}
  return {employer:await tx.employer.update({where:{id:employer.id},data:{website:input.website,careersUrl:input.careersUrl,boardProvider:input.boardProvider,boardToken:input.boardToken,permissionEvidenceUrl:input.permissionEvidenceUrl??null,feedApproved:input.feedApproved}})};
 });
});
