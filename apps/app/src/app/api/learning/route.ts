import {z} from 'zod';
import {body,endpoint,HttpError} from '@/lib/http';
import {requireUser} from '@/lib/user';
import {prisma} from '@/lib/prisma';
import {curriculumVersion,emptyLearning,grade,questions} from '@/lib/learning';
import type {LearningState,Mode} from '@/lib/learning';
const mode=z.enum(['diagnostic','practice','reassessment']);
const answers=z.record(z.string().max(50),z.number().int().min(0).max(2)).refine(x=>Object.keys(x).length<=5);
const input=z.discriminatedUnion('action',[
 z.object({action:z.literal('settings'),revision:z.number().int().min(0),hours:z.number().int().min(1).max(20),selectedJobIds:z.array(z.string().max(100)).max(10)}),
 z.object({action:z.literal('save'),revision:z.number().int().min(0),mode,answers,reflection:z.string().max(4000)}),
 z.object({action:z.literal('submit'),revision:z.number().int().min(0),mode,answers,reflection:z.string().min(20).max(4000)}),
 z.object({action:z.literal('resource'),revision:z.number().int().min(0),skill:z.enum(['sql','cleaning','statistics','metrics','communication'])}),
 z.object({action:z.literal('interview'),revision:z.number().int().min(0),jobId:z.string().max(100),question:z.string().min(1).max(1000),answer:z.string().min(20).max(4000)})
]);
export const GET=endpoint(async()=>{
 const user=await requireUser();const row=await prisma.learningProgress.findUnique({where:{userId:user.id}});
 return {revision:row?.revision??0,state:row?.state??emptyLearning(),questions:Object.fromEntries((['diagnostic','practice','reassessment'] as Mode[]).map(m=>[m,questions(m)]))};
});
export const POST=endpoint(async req=>{
 const user=await requireUser();const data=await body(req,input);
 return prisma.$transaction(async tx=>{
  // Serialize per user, including creation, without trusting a client-provided user ID.
  const active=await tx.user.updateMany({where:{id:user.id,deletingAt:null},data:{updatedAt:new Date()}});
  if(!active.count)throw new HttpError(409,'Account deletion is in progress.');
  const row=await tx.learningProgress.findUnique({where:{userId:user.id}});
  if((row?.revision??0)!==data.revision)throw new HttpError(409,'Progress changed in another tab. Reload before saving.');
  const state=(row?.state??emptyLearning()) as unknown as LearningState;
  let event:string|undefined;
  if(data.action==='settings'){
   const count=await tx.job.count({where:{id:{in:data.selectedJobIds},closedAt:null}});
   if(count!==new Set(data.selectedJobIds).size)throw new HttpError(400,'Select active roles.');
   state.hours=data.hours;state.selectedJobIds=[...new Set(data.selectedJobIds)];
  }
  if(data.action==='save'||data.action==='submit'){
   const valid=questions(data.mode);if(Object.keys(data.answers).some(id=>!valid.some(q=>q.id===id)))throw new HttpError(400,'This exercise has changed. Reload it.');
   if(data.action==='save')state.draft={mode:data.mode,answers:data.answers,reflection:data.reflection};
   else{
    if(state.attempts.length>=100)throw new HttpError(429,'The pilot supports 100 attempts. Export your history and contact support.');
    if(data.mode==='reassessment'&&!state.attempts.some(a=>a.mode==='diagnostic'))throw new HttpError(400,'Complete the diagnostic first.');
    let results;try{results=grade(data.mode,data.answers);}catch(e){throw new HttpError(400,(e as Error).message);}
    state.attempts.push({id:crypto.randomUUID(),mode:data.mode,version:curriculumVersion,createdAt:new Date().toISOString(),results,reflection:data.reflection});state.draft=null;event=data.mode==='practice'?'PRACTICE_COMPLETED':'ASSESSMENT_COMPLETED';
   }
  }
  if(data.action==='resource'){state.completedResources=[...new Set([...state.completedResources,data.skill])];event='RESOURCE_REVIEWED';}
  if(data.action==='interview'){
   if(!await tx.job.findUnique({where:{id:data.jobId}}))throw new HttpError(404,'Role unavailable.');
   if(state.interviews.length>=40)throw new HttpError(429,'The pilot supports 40 saved interview responses.');
   state.interviews.push({id:crypto.randomUUID(),jobId:data.jobId,question:data.question,answer:data.answer,createdAt:new Date().toISOString()});event='INTERVIEW_PRACTISED';
  }
  const revision=data.revision+1;
  await tx.learningProgress.upsert({where:{userId:user.id},create:{userId:user.id,state:JSON.parse(JSON.stringify(state)),revision},update:{state:JSON.parse(JSON.stringify(state)),revision}});
  if(event)await tx.productEvent.create({data:{userId:user.id,kind:event}});
  return {state,revision};
 });
});
