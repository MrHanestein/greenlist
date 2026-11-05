import { endpoint,requireCron } from '@/lib/http';
import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { shortlist } from '@/lib/shortlist';
import { shortlistPeriod } from '@/lib/domain';
import { recoverPackRuns } from '@/lib/packRuns';
import { retryDeletions } from '@/lib/deletion';
export const maxDuration=300;
export const POST=endpoint(async req=>{
 requireCron(req);await retryDeletions();await recoverPackRuns();let created=0;
 const cursor=new URL(req.url).searchParams.get('cursor');
 const users=await prisma.user.findMany({where:{searchStatus:'SEARCHING',onboardedAt:{not:null},deletingAt:null,...(cursor?{id:{gt:cursor}}:{})},orderBy:{id:'asc'},take:100});
 for(const u of users){
  const jobs=await shortlist(u);
  const today=new Date();today.setUTCHours(0,0,0,0);
  const prior=await prisma.shortlist.findMany({where:{userId:u.id,createdAt:{lt:today,gte:new Date(Date.now()-30*86400000)}},select:{jobIds:true}});
  const known=new Set(prior.flatMap(s=>s.jobIds));
  const fresh=jobs.filter(j=>!known.has(j.id));
  if(fresh.length){
   const key='shortlist:'+shortlistPeriod(true);
   const old=await prisma.notification.findUnique({where:{userId_key:{userId:u.id,key}}});
   if(!old){await prisma.notification.create({data:{userId:u.id,key,message:fresh.length+' new matches are ready. Review sponsorship evidence before applying.'}});created++;}
  }
  const since=new Date(Date.now()-7*86400000);
  const apps=await prisma.application.findMany({where:{userId:u.id,updatedAt:{gte:since}}});
  if(apps.length){const key='review:'+shortlistPeriod(false);await prisma.notification.upsert({where:{userId_key:{userId:u.id,key}},update:{},create:{userId:u.id,key,message:'Your weekly review: '+apps.filter(a=>a.submittedAt && a.submittedAt>=since).length+' submissions, '+apps.filter(a=>a.status==='INTERVIEW').length+' applications currently at interview. Review follow-ups in your tracker.'}});}
  const due=await prisma.application.findMany({where:{userId:u.id,status:{notIn:['REJECTED','WITHDRAWN','OFFER']},OR:[{deadline:{gte:new Date(Date.now()-86400000),lte:new Date(Date.now()+86400000)}},{followUpAt:{gte:new Date(Date.now()-86400000),lte:new Date(Date.now()+86400000)}}]}});
  for(const app of due)for(const [kind,when] of [['deadline',app.deadline],['follow-up',app.followUpAt]] as const){if(!when||Math.abs(when.getTime()-Date.now())>86400000)continue;const key='due:'+kind+':'+app.id+':'+when.toISOString().slice(0,10);await prisma.notification.upsert({where:{userId_key:{userId:u.id,key}},update:{},create:{userId:u.id,key,message:'Review the '+kind+' for '+app.title+' at '+app.company+'.'}});}
  if(u.emailAlerts && process.env.RESEND_API_KEY && process.env.ALERT_FROM){
   const pending=await prisma.notification.findMany({where:{userId:u.id,emailedAt:null,createdAt:{gte:new Date(Date.now()-86400000)}},orderBy:[{createdAt:'desc'},{id:'desc'}],take:10});
   if(pending.length){
    const digestKey=createHash('sha256').update(u.id+':'+pending.map(n=>n.id).sort().join(':')).digest('hex');
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':digestKey},body:JSON.stringify({from:process.env.ALERT_FROM,to:u.email,subject:'Your Greenlist search update',text:pending.map(n=>n.message).join('\n\n')+'\n\nOpen '+process.env.APP_URL+'/dashboard\nTurn off email updates in Profile.'}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)await prisma.syncRun.create({data:{kind:'email',status:'FAILED',message:'An email delivery failed and remains pending for retry'}});
    if(response.ok)await prisma.notification.updateMany({where:{id:{in:pending.map(n=>n.id)}},data:{emailedAt:new Date()}});
   }
  }
 }
 return {created,nextCursor:users.length===100?users[users.length-1].id:null};
});
