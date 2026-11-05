import { z } from 'zod';
import { body,endpoint,HttpError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { serial } from '@/lib/transaction';
import { isPlus,packLimit,packPeriod } from '@/lib/domain';
import { shortlist } from '@/lib/shortlist';
import { aiConfig,generatePreparation,packContentSchema } from '@/lib/preparation';
import { recoverPackRuns } from '@/lib/packRuns';
export const maxDuration=120;
export const GET=endpoint(async()=>{const u=await requireUser();const plus=isPlus(u);const usage=await prisma.usage.findUnique({where:{userId_period_kind:{userId:u.id,period:packPeriod(plus,new Date(),u.subscriptionPeriodStart),kind:'PACK'}}});return {packs:await prisma.applicationPack.findMany({where:{userId:u.id},orderBy:{createdAt:'desc'},take:40}),used:usage?.count??0,limit:packLimit(plus),resetsAt:plus?u.subscriptionValidUntil:null};});
export const POST=endpoint(async req=>{
 const u=await requireUser();const {jobId,requestKey,questions}=await body(req,z.object({jobId:z.string(),requestKey:z.string().uuid(),questions:z.array(z.string().trim().min(1).max(1000)).max(12).default([])}));
 const duplicate=await prisma.applicationPack.findUnique({where:{userId_requestKey:{userId:u.id,requestKey}}});if(duplicate)return {pack:duplicate};
 const config=aiConfig();await recoverPackRuns();
 const job=(await shortlist(u)).find(j=>j.id===jobId);if(!job)throw new HttpError(404,'Choose an active job from your shortlist');
 const facts=await prisma.approvedFact.findMany({where:{userId:u.id},orderBy:{updatedAt:'desc'},take:20});
 if(!facts.length)throw new HttpError(400,'Add an approved project or achievement in Application memory first');
 const selectedQuestions=[...new Set(questions.length?questions:job.questions)].slice(0,12);
 if(!selectedQuestions.length)throw new HttpError(400,'Paste the application questions from the employer’s form first.');
 const run=await serial(async tx=>{
  const fresh=await tx.user.findUniqueOrThrow({where:{id:u.id}});if(fresh.deletingAt)throw new HttpError(403,'Account deletion is in progress');
  const old=await tx.aiRun.findUnique({where:{userId_requestKey:{userId:u.id,requestKey}}});if(old)throw new HttpError(409,old.status==='PENDING'?'This pack is still being prepared.':'This attempt has finished. Start a new preparation request.');
  const plus=isPlus(fresh),period=packPeriod(plus,new Date(),fresh.subscriptionPeriodStart),budgetPeriod=new Date().toISOString().slice(0,7);
  await tx.usage.upsert({where:{userId_period_kind:{userId:u.id,period,kind:'PACK'}},create:{userId:u.id,period,kind:'PACK'},update:{}});
  const claim=await tx.usage.updateMany({where:{userId:u.id,period,kind:'PACK',count:{lt:packLimit(plus)}},data:{count:{increment:1}}});
  if(!claim.count)throw new HttpError(402,plus?'Your 40 packs have been used for this subscription month.':'Your three free preparation trials have been used.');
  await tx.serviceBudget.upsert({where:{period:budgetPeriod},create:{period:budgetPeriod},update:{}});
  const budget=await tx.serviceBudget.updateMany({where:{period:budgetPeriod,spentMicros:{lte:config.budgetMicros-config.reservedMicros}},data:{spentMicros:{increment:config.reservedMicros}}});
  if(!budget.count)throw new HttpError(503,'Preparation is temporarily at capacity. Your allowance has not been used.');
  return tx.aiRun.create({data:{userId:u.id,requestKey,period,budgetPeriod,reservedMicros:config.reservedMicros,model:config.model,expiresAt:new Date(Date.now()+180000)}});
 });
 try{
  const generated=await generatePreparation(job,facts,u.cvText,selectedQuestions);
  return await serial(async tx=>{
   const active=await tx.aiRun.updateMany({where:{id:run.id,status:'PENDING'},data:{status:'SUCCEEDED',actualMicros:generated.actualMicros}});if(!active.count)throw new HttpError(409,'Preparation expired. Your allowance was restored.');
   const fresh=await tx.user.findUniqueOrThrow({where:{id:u.id}});if(fresh.deletingAt)throw new HttpError(403,'Account deletion is in progress');
   await tx.serviceBudget.update({where:{period:run.budgetPeriod},data:{spentMicros:{increment:generated.actualMicros-run.reservedMicros}}});
   const content={...generated.content,evidence:facts.map(f=>({id:f.id,title:f.title,body:f.body})),model:generated.model};
   const pack=await tx.applicationPack.create({data:{userId:u.id,jobId,requestKey,content,revisions:{create:{revision:1,content}}}});
   await tx.application.upsert({where:{userId_externalUrl:{userId:u.id,externalUrl:job.url}},create:{userId:u.id,jobId,externalUrl:job.url,title:job.title,company:job.company},update:{}});
   await tx.productEvent.create({data:{userId:u.id,kind:'PACK_CREATED'}});return {pack};
  });
 }catch(e){
  await serial(async tx=>{const claim=await tx.aiRun.updateMany({where:{id:run.id,status:'PENDING'},data:{status:'FAILED'}});if(claim.count)await tx.usage.updateMany({where:{userId:u.id,period:run.period,kind:'PACK',count:{gt:0}},data:{count:{decrement:1}}});});
  if(e instanceof HttpError)throw e;throw new HttpError(502,'Preparation could not be completed or verified. Your allowance has been restored.');
 }
});
export const PATCH=endpoint(async req=>{
 const u=await requireUser();const input=await body(req,z.object({id:z.string(),revision:z.number().int().positive(),content:packContentSchema,reviewed:z.literal(true)}));
 return serial(async tx=>{
  const old=await tx.applicationPack.findFirst({where:{id:input.id,userId:u.id}});if(!old)throw new HttpError(404,'Pack not found');
  if(old.revision!==input.revision)throw new HttpError(409,'A newer edit exists. Reopen this pack before saving.');
  const previous=old.content as Record<string,unknown>;
  const content={...input.content,evidence:previous.evidence??[],model:previous.model??null,userReviewedAt:new Date().toISOString()};
  const pack=await tx.applicationPack.update({where:{id:old.id},data:{content,revision:{increment:1},revisions:{create:{revision:old.revision+1,content}}}});
  await tx.productEvent.create({data:{userId:u.id,kind:'PACK_REVIEWED'}});return {pack};
 });
});

