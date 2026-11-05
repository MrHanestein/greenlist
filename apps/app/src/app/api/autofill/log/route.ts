import { z } from 'zod';
import { body,endpoint,HttpError } from '@/lib/http';
import { extensionUser } from '@/lib/autofillToken';
import { serial } from '@/lib/transaction';
import { canonicalUrl } from '@/lib/domain';
export const POST=endpoint(async req=>{
 const u=await extensionUser(req);const input=await body(req,z.object({eventKey:z.string().uuid(),atsName:z.enum(['greenhouse','lever']),hostUrl:z.string().url().max(2000),title:z.string().max(200).default('Application draft'),fieldsFilled:z.number().int().min(0).max(200),fieldsLowConfidence:z.number().int().min(0).max(200)}));
 const url=canonicalUrl(input.hostUrl),host=new URL(url).hostname;
 if(!['greenhouse.io','greenhouse.io','greenhouse.com','lever.co'].some(h=>host===h||host.endsWith('.'+h)))throw new HttpError(400,'Unsupported application host');
 return serial(async tx=>{
  const event=await tx.autofillEvent.upsert({where:{userId_eventKey:{userId:u.id,eventKey:input.eventKey}},create:{userId:u.id,eventKey:input.eventKey,atsName:input.atsName,hostUrl:url,fieldsFilled:input.fieldsFilled,fieldsLowConfidence:input.fieldsLowConfidence},update:{}});
  const application=await tx.application.upsert({where:{userId_externalUrl:{userId:u.id,externalUrl:url}},create:{userId:u.id,externalUrl:url,title:input.title,company:'Confirm employer',appliedVia:'autofill',status:'DRAFTED'},update:{}});
  return {eventId:event.id,applicationId:application.id,status:application.status};
 });
});