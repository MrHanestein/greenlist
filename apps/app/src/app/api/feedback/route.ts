import { z } from 'zod';
import { endpoint,body,HttpError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
export const POST=endpoint(async req=>{
 const u=await requireUser();const input=await body(req,z.discriminatedUnion('type',[z.object({type:z.literal('job'),jobId:z.string(),kind:z.enum(['IRRELEVANT','ALREADY_APPLIED','DISPUTED_EVIDENCE'])}),z.object({type:z.literal('search'),status:z.enum(['SEARCHING','FOUND_JOB'])})]));
 if(input.type==='job'){
  if(!await prisma.shortlist.findFirst({where:{userId:u.id,jobIds:{has:input.jobId}}}))throw new HttpError(404,'Job not found in your shortlists');
  await prisma.jobFeedback.upsert({where:{userId_jobId:{userId:u.id,jobId:input.jobId}},create:{userId:u.id,jobId:input.jobId,kind:input.kind},update:{kind:input.kind}});
 }else await prisma.user.update({where:{id:u.id},data:{searchStatus:input.status}});
 await prisma.productEvent.create({data:{userId:u.id,kind:input.type==='job'?input.kind:input.status}});return {ok:true};
});
