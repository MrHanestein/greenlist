import {z} from 'zod';
import {endpoint,body,HttpError} from '@/lib/http';
import {requireUser} from '@/lib/user';
import {prisma} from '@/lib/prisma';
import {serial} from '@/lib/transaction';
import {aiConfig} from '@/lib/preparation';
import {recoverPackRuns} from '@/lib/packRuns';
import {generateInterviewFeedback} from '@/lib/interview';
import type {LearningState} from '@/lib/learning';
export const maxDuration=120;
export const POST=endpoint(async req=>{
 const user=await requireUser();const {interviewId,requestKey}=await body(req,z.object({interviewId:z.string().max(100),requestKey:z.string().uuid()}));
 const config=aiConfig();await recoverPackRuns();const period=new Date().toISOString().slice(0,7),kind='INTERVIEW';
 const reserved=await serial(async tx=>{
  const valid=await tx.user.updateMany({where:{id:user.id,deletingAt:null},data:{updatedAt:new Date()}});if(!valid.count)throw new HttpError(409,'Account deletion is in progress.');
  const row=await tx.learningProgress.findUnique({where:{userId:user.id}});const state=row?.state as unknown as LearningState|undefined;const interview=state?.interviews.find(i=>i.id===interviewId);if(!interview)throw new HttpError(404,'Saved response not found.');
  if(interview.feedback)return {existing:true as const,state,revision:row!.revision};
  if(await tx.aiRun.findUnique({where:{userId_requestKey:{userId:user.id,requestKey}}}))throw new HttpError(409,'This feedback request has already been attempted. Reload or try again.');
  const usage=await tx.usage.upsert({where:{userId_period_kind:{userId:user.id,period,kind}},create:{userId:user.id,period,kind,count:0},update:{}});if(usage.count>=10)throw new HttpError(429,'The free pilot allows ten AI interview feedback responses per calendar month.');
  const budget=await tx.serviceBudget.upsert({where:{period},create:{period,spentMicros:0},update:{}});if(budget.spentMicros+config.reservedMicros>config.budgetMicros)throw new HttpError(429,'The pilot AI budget is reached. Your allowance has not been used.');
  const job=await tx.job.findUnique({where:{id:interview.jobId}});if(!job)throw new HttpError(404,'Role unavailable.');
  await tx.usage.update({where:{id:usage.id},data:{count:{increment:1}}});await tx.serviceBudget.update({where:{period},data:{spentMicros:{increment:config.reservedMicros}}});
  const run=await tx.aiRun.create({data:{userId:user.id,requestKey,period,kind,budgetPeriod:period,reservedMicros:config.reservedMicros,model:config.model,expiresAt:new Date(Date.now()+180000)}});
  const facts=await tx.approvedFact.findMany({where:{userId:user.id},take:20});return {existing:false as const,run,interview,description:job.description,facts};
 });
 if(reserved.existing)return {state:reserved.state,revision:reserved.revision};
 try{
  const result=await generateInterviewFeedback({question:reserved.interview.question,answer:reserved.interview.answer,description:reserved.description,facts:reserved.facts});
  return await serial(async tx=>{
   const active=await tx.user.updateMany({where:{id:user.id,deletingAt:null},data:{updatedAt:new Date()}});if(!active.count)throw new HttpError(409,'Account deletion is in progress.');
   const row=await tx.learningProgress.findUniqueOrThrow({where:{userId:user.id}});const state=row.state as unknown as LearningState;const item=state.interviews.find(i=>i.id===interviewId);if(!item)throw new HttpError(409,'Saved response changed.');
   const claim=await tx.aiRun.updateMany({where:{id:reserved.run.id,status:'PENDING'},data:{status:'SUCCEEDED',actualMicros:result.actualMicros}});if(!claim.count)throw new HttpError(409,'Feedback request expired. Try again.');
   // A concurrent request may have completed the same response first: refund its user unit.
   if(item.feedback)await tx.usage.updateMany({where:{userId:user.id,period,kind,count:{gt:0}},data:{count:{decrement:1}}});else item.feedback={...result.content,model:result.model,createdAt:new Date().toISOString()};
   await tx.serviceBudget.update({where:{period},data:{spentMicros:{increment:result.actualMicros-config.reservedMicros}}});
   const saved=await tx.learningProgress.update({where:{userId:user.id},data:{state:JSON.parse(JSON.stringify(state)),revision:{increment:1}}});
   await tx.productEvent.create({data:{userId:user.id,kind:'INTERVIEW_FEEDBACK_GENERATED'}});return {state,revision:saved.revision};
  });
 }catch(e){await serial(async tx=>{const claim=await tx.aiRun.updateMany({where:{id:reserved.run.id,status:'PENDING'},data:{status:'FAILED'}});if(claim.count)await tx.usage.updateMany({where:{userId:user.id,period,kind,count:{gt:0}},data:{count:{decrement:1}}});});if(e instanceof HttpError)throw e;throw new HttpError(502,'Feedback could not be completed. Your feedback allowance was restored.');}
});
