import { endpoint,HttpError } from '@/lib/http';
import { extensionUser } from '@/lib/autofillToken';
import { prisma } from '@/lib/prisma';
import { canonicalUrl } from '@/lib/domain';
import { sensitiveQuestion } from '@/lib/preparation';
export const GET=endpoint(async req=>{
 const user=await extensionUser(req);if(!user.contact)throw new HttpError(400,'Complete your profile first');
 let answers:{question:string;answer:string}[]=[];
 const raw=new URL(req.url).searchParams.get('jobUrl');
 if(raw){let url:string;try{url=canonicalUrl(raw);}catch{throw new HttpError(400,'Invalid job address');}
  const pack=await prisma.applicationPack.findFirst({where:{userId:user.id,job:{OR:[{url},{sources:{some:{url}}}]}},orderBy:{createdAt:'desc'}});
  const content=pack?.content as {userReviewedAt?:string;answers?:{question:string;answer:string}[]}|undefined;
  if(content?.userReviewedAt)answers=(content.answers??[]).filter(a=>!sensitiveQuestion.test(a.question)).map(a=>({question:a.question,answer:a.answer}));
 }
 return {contact:user.contact,answers,review:['Confirm current work authorisation yourself.','Confirm whether you need sponsorship now or in future.','Check education, employment and every filled answer against this form.','Upload and review the CV for this particular application.'],expiresInDays:7};
});
