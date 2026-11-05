import { z } from 'zod';
import { body,endpoint,HttpError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { serial } from '@/lib/transaction';
import { canonicalUrl } from '@/lib/domain';
const snapshot=z.object({cvText:z.string().max(30000),answers:z.string().max(20000)});
export const GET=endpoint(async()=>{const u=await requireUser();return {applications:await prisma.application.findMany({where:{userId:u.id},include:{versions:{orderBy:{createdAt:'desc'},take:10}},orderBy:{updatedAt:'desc'},take:200})};});
export const POST=endpoint(async req=>{const u=await requireUser();const input=await body(req,z.object({url:z.string().url().startsWith('https://').max(2000),title:z.string().min(1).max(200),company:z.string().min(1).max(200)}));const externalUrl=canonicalUrl(input.url);return {application:await prisma.application.upsert({where:{userId_externalUrl:{userId:u.id,externalUrl}},create:{userId:u.id,externalUrl,title:input.title,company:input.company,appliedVia:'manual'},update:{}})};});
export const PATCH=endpoint(async req=>{
 const u=await requireUser();const input=await body(req,z.object({id:z.string(),status:z.enum(['DRAFTED','SENT','REPLIED','INTERVIEW','OFFER','REJECTED','WITHDRAWN']),requestKey:z.string().uuid(),confirmSubmitted:z.boolean().default(false),snapshot:snapshot.optional(),notes:z.string().max(4000).default(''),deadline:z.string().datetime().nullable().optional(),followUpAt:z.string().datetime().nullable().optional()}));
 return serial(async tx=>{
  const app=await tx.application.findFirst({where:{id:input.id,userId:u.id}});if(!app)throw new HttpError(404,'Application not found');
  const sent=input.status==='SENT';
  if(sent && (!input.confirmSubmitted || !input.snapshot))throw new HttpError(400,'Confirm submission and save the CV and answers you actually used');
  const duplicate=await tx.submissionEvent.findUnique({where:{applicationId_requestKey:{applicationId:app.id,requestKey:input.requestKey}}});if(duplicate)return {application:app};
  if(sent){
   await tx.productEvent.create({data:{userId:u.id,kind:"SUBMISSION_CONFIRMED"}});
   await tx.submissionEvent.create({data:{applicationId:app.id,requestKey:input.requestKey}});
   await tx.applicationVersion.create({data:{applicationId:app.id,content:input.snapshot!}});
  }
  const application=await tx.application.update({where:{id:app.id},data:{status:input.status,notes:input.notes,deadline:input.deadline===undefined?undefined:input.deadline?new Date(input.deadline):null,followUpAt:input.followUpAt===undefined?undefined:input.followUpAt?new Date(input.followUpAt):null,submittedAt:sent?app.submittedAt ?? new Date():undefined}});
  return {application};
 });
});