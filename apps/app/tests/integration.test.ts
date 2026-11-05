import test,{before,after,mock} from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { User } from '@prisma/client';
const enabled=!!process.env.INTEGRATION_DATABASE_URL;
if(enabled)process.env.DATABASE_URL=process.env.INTEGRATION_DATABASE_URL;
test('database and authenticated endpoint integration',{skip:!enabled},async t=>{
 if(!/^postgresql:\/\/[^@]+@(?:127\.0\.0\.1|localhost):/.test(process.env.DATABASE_URL!))throw new Error('Integration tests require a loopback test database');
 const {prisma}=require('../src/lib/prisma') as typeof import('../src/lib/prisma');
 const userModule=require('../src/lib/user') as typeof import('../src/lib/user');
 const {issueAutofillToken}=require('../src/lib/autofillToken') as typeof import('../src/lib/autofillToken');
 const {sponsorEvidence}=require('../src/lib/sponsorMatch') as typeof import('../src/lib/sponsorMatch');
 const {importRegister}=require('../src/lib/register') as typeof import('../src/lib/register');
 const {shortlist}=require('../src/lib/shortlist') as typeof import('../src/lib/shortlist');
 const {ingestJobs}=require('../src/lib/ingest') as typeof import('../src/lib/ingest');
 const packs=require('../src/app/api/packs/route') as typeof import('../src/app/api/packs/route');
 const apps=require('../src/app/api/applications/route') as typeof import('../src/app/api/applications/route');
 const logs=require('../src/app/api/autofill/log/route') as typeof import('../src/app/api/autofill/log/route');
 const extensionProfile=require('../src/app/api/autofill/profile/route') as typeof import('../src/app/api/autofill/profile/route');
 const tokenRoutes=require('../src/app/api/autofill/token/route') as typeof import('../src/app/api/autofill/token/route');
 const prefix='integration-'+randomUUID();let active:User;const jobIds:string[]=[];const sponsorIds:string[]=[];const users:User[]=[];
 process.env.AUTOFILL_API_TOKEN_SECRET='integration-only-secret-value-at-least-32-characters';
 const request=(value:unknown,token?:string)=>new Request('http://localhost:3000/api/test',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(value)});
 try{
  for(const suffix of ['a','b'])users.push(await prisma.user.create({data:{clerkId:prefix+suffix,email:prefix+suffix+'@example.com',name:'Fixture',onboardedAt:new Date(),targetRoles:['Software'],skills:['Python'],contact:{firstName:'Ada',lastName:'Lovelace',email:'ada@example.com'},cvText:'Fixture CV'}}));
  const prep=require('../src/lib/preparation');mock.method(prep,'aiConfig',()=>({model:'test-model',reservedMicros:1000,budgetMicros:50000000}));const generation=mock.method(prep,'generatePreparation',async(job:any,facts:any[],cv:string)=>({content:require('../src/lib/domain').buildPack(job,facts,cv),model:'test-model',actualMicros:1}));
  active=users[0];mock.method(userModule,'requireUser',async()=>prisma.user.findUniqueOrThrow({where:{id:active.id}}));
  await t.test('learning saves are isolated, reject stale writes and grade on the server',async()=>{
   const learning=require('../src/app/api/learning/route');
   const payload={action:'save',revision:0,mode:'diagnostic',answers:{'d-sql':1},reflection:'Check the row grain before counting.'};
   assert.equal((await learning.POST(request(payload))).status,200);
   assert.equal((await learning.POST(request(payload))).status,409);
   active=users[1];const other=await (await learning.GET(new Request('http://localhost/api/learning'))).json();assert.equal(other.state.draft,null);assert.equal(other.revision,0);
   active=users[0];assert.equal((await learning.POST(request({...payload,action:'submit',revision:1}))).status,400);
   const complete={...payload,action:'submit',revision:1,answers:{'d-sql':1,'d-clean':2,'d-stat':0,'d-metric':1,'d-comms':2}};
   const r=await learning.POST(request(complete));assert.equal(r.status,200);const result=await r.json();assert.equal(result.state.attempts[0].results.filter((x:any)=>x.correct).length,5);
   assert.equal((await learning.POST(request(complete))).status,409);
   const responses=await Promise.all([1,2].map(()=>learning.POST(request({action:'resource',revision:2,skill:'sql'}))));assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
  });
  const job=await prisma.job.create({data:{externalId:prefix,source:'test',title:'Graduate Software Engineer',company:prefix,companyNorm:prefix,url:'https://boards.greenhouse.io/fixture/jobs/'+prefix,description:'Python. We offer visa sponsorship.',location:'London, UK',questions:['Describe a project'],postedAt:new Date(),vacancyPolicy:'OFFERED'}});jobIds.push(job.id);
  await prisma.shortlist.create({data:{userId:active.id,period:require('../src/lib/domain').shortlistPeriod(true),jobIds:[job.id]}});
  await prisma.approvedFact.create({data:{userId:active.id,title:'Project',body:'I used Python in a university data project.',approvedAt:new Date()}});
  await t.test('interview feedback is private, cached and refunds only its own quota on failure',async()=>{
   const learning=require('../src/app/api/learning/route'),feedback=require('../src/app/api/learning/feedback/route'),provider=require('../src/lib/interview');
   const generation=mock.method(provider,'generateInterviewFeedback',async()=>({content:{points:[{area:'reasoning',quote:'metric',comment:'Define it precisely.'}],uncertainties:['Practice guidance only'],nextTask:'Define the denominator.',nextQuestion:'How would you validate it?'},actualMicros:1,model:'test-model'}));
   const row=await prisma.learningProgress.findUniqueOrThrow({where:{userId:active.id}});
   const response=await learning.POST(request({action:'interview',revision:row.revision,jobId:job.id,question:'How would you analyse this?',answer:'I would define the metric and check the denominator.'}));assert.equal(response.status,200);const item=(await response.json()).state.interviews[0];
   active=users[1];assert.equal((await feedback.POST(request({interviewId:item.id,requestKey:randomUUID()}))).status,404);active=users[0];
   generation.mock.mockImplementationOnce(async()=>{throw new Error('Provider failed');});assert.equal((await feedback.POST(request({interviewId:item.id,requestKey:randomUUID()}))).status,502);
   assert.equal((await prisma.usage.findFirstOrThrow({where:{userId:active.id,kind:'INTERVIEW'}})).count,0);
   assert.equal((await feedback.POST(request({interviewId:item.id,requestKey:randomUUID()}))).status,200);
   assert.equal((await feedback.POST(request({interviewId:item.id,requestKey:randomUUID()}))).status,200);
   assert.equal((await prisma.usage.findFirstOrThrow({where:{userId:active.id,kind:'INTERVIEW'}})).count,1);
   assert.equal(await prisma.usage.count({where:{userId:active.id,kind:'PACK'}}),0);
  });
  await t.test('free preparation limit is atomic under concurrent requests',async()=>{
   const results=await Promise.all(Array.from({length:5},()=>packs.POST(request({jobId:job.id,requestKey:randomUUID()}))));
   assert.equal(results.filter(r=>r.status===200).length,3);assert.equal(results.filter(r=>r.status===402).length,2);
   assert.equal(await prisma.applicationPack.count({where:{userId:active.id}}),3);
  });
  await t.test('retrying an existing pack does not consume another unit',async()=>{
   const p=await prisma.applicationPack.findFirstOrThrow({where:{userId:active.id}});
   assert.equal((await packs.POST(request({jobId:job.id,requestKey:p.requestKey}))).status,200);
   assert.equal((await prisma.usage.findFirstOrThrow({where:{userId:active.id,kind:'PACK'}})).count,3);
  });
  await t.test('Plus grants exactly 40 packs and does not reset free trials',async()=>{
   const period=require('../src/lib/domain').packPeriod(true);
   await prisma.user.update({where:{id:active.id},data:{subscriptionTier:'PLUS',subscriptionValidUntil:new Date(Date.now()+86400000)}});
   await prisma.usage.create({data:{userId:active.id,period,kind:'PACK',count:39}});
   const responses=await Promise.all([1,2].map(()=>packs.POST(request({jobId:job.id,requestKey:randomUUID()}))));
   assert.equal(responses.filter(r=>r.status===200).length,1);assert.equal(responses.filter(r=>r.status===402).length,1);
   await prisma.user.update({where:{id:active.id},data:{subscriptionTier:'FREE',subscriptionValidUntil:null}});
   assert.equal((await packs.POST(request({jobId:job.id,requestKey:randomUUID()}))).status,402);
  });
  await t.test('failed AI generation restores allowance and stores no pack',async()=>{active=users[1];await prisma.shortlist.upsert({where:{userId_period:{userId:active.id,period:require('../src/lib/domain').shortlistPeriod(true)}},create:{userId:active.id,period:require('../src/lib/domain').shortlistPeriod(true),jobIds:[job.id]},update:{}});await prisma.approvedFact.create({data:{userId:active.id,title:'Example',body:'I used Python in coursework.',approvedAt:new Date()}});generation.mock.mockImplementationOnce(async()=>{throw new Error('Provider failed');});const r=await packs.POST(request({jobId:job.id,requestKey:randomUUID()}));assert.equal(r.status,502);assert.equal((await prisma.usage.findFirstOrThrow({where:{userId:active.id,kind:'PACK'}})).count,0);assert.equal(await prisma.applicationPack.count({where:{userId:active.id}}),0);active=users[0];});
  await t.test('saved pack revisions reject stale edits and foreign ownership',async()=>{const p=await prisma.applicationPack.findFirstOrThrow({where:{userId:active.id}});const input={id:p.id,revision:1,content:p.content,reviewed:true};assert.equal((await packs.PATCH(request(input))).status,200);assert.equal((await packs.PATCH(request(input))).status,409);active=users[1];assert.equal((await packs.PATCH(request({...input,revision:2}))).status,404);active=users[0];assert.equal(await prisma.packRevision.count({where:{packId:p.id}}),2);});
  await t.test('private data cannot be accessed through another user’s IDs',async()=>{
   const app=await prisma.application.findFirstOrThrow({where:{userId:active.id}});active=users[1];
   assert.equal((await apps.PATCH(request({id:app.id,status:'INTERVIEW',requestKey:randomUUID()}))).status,404);
   const res=await apps.GET(new Request('http://localhost/api/applications'));assert.deepEqual((await res.json()).applications,[]);
   active=users[0];
  });
  await t.test('submission requires confirmation and records one immutable version',async()=>{
   const app=await prisma.application.findFirstOrThrow({where:{userId:active.id}});
   assert.equal((await apps.PATCH(request({id:app.id,status:'SENT',requestKey:randomUUID()}))).status,400);
   const payload={id:app.id,status:'SENT',requestKey:randomUUID(),confirmSubmitted:true,snapshot:{cvText:'The actual CV',answers:'My actual answer'}};
   assert.equal((await apps.PATCH(request(payload))).status,200);assert.equal((await apps.PATCH(request(payload))).status,200);
   assert.equal(await prisma.applicationVersion.count({where:{applicationId:app.id}}),1);
   assert.equal(await prisma.submissionEvent.count({where:{applicationId:app.id}}),1);
   assert.equal((await prisma.application.findUniqueOrThrow({where:{id:app.id}})).status,'SENT');
  });
  await t.test('extension retry creates one draft and never marks it submitted',async()=>{
   const token=await issueAutofillToken(active.id,active.extensionVersion);
   const payload={eventKey:randomUUID(),atsName:'lever',hostUrl:'https://jobs.lever.co/example/'+prefix,title:'Test draft',fieldsFilled:3,fieldsLowConfidence:2};
   assert.equal((await logs.POST(request(payload,token))).status,200);assert.equal((await logs.POST(request(payload,token))).status,200);
   assert.equal(await prisma.autofillEvent.count({where:{userId:active.id}}),1);
   const a=await prisma.application.findFirstOrThrow({where:{externalUrl:payload.hostUrl,userId:active.id}});assert.equal(a.status,'DRAFTED');assert.equal(a.submittedAt,null);
  });
  await t.test('extension sees contact data only and revocation takes effect immediately',async()=>{
   const token=await issueAutofillToken(active.id,active.extensionVersion);const req=()=>new Request('http://localhost/api/autofill/profile',{headers:{Authorization:'Bearer '+token}});
   const data=await (await extensionProfile.GET(req())).json();assert.ok(data.contact);assert.equal(data.cvText,undefined);assert.equal(data.needsSponsorshipNow,undefined);
   assert.equal((await tokenRoutes.DELETE(request({}))).status,200);
   assert.equal((await extensionProfile.GET(req())).status,401);
   assert.equal((await extensionProfile.GET(new Request('http://localhost/api/autofill/profile'))).status,401);
  });
  await t.test('ambiguous names and other routes do not claim a Skilled Worker licence',async()=>{
   const snapshot=await prisma.sponsorSnapshot.findFirstOrThrow({orderBy:{sourceDate:'desc'}});
   for(const [name,town,route] of [[prefix+' shared','London','Skilled Worker'],[prefix+' shared','York','Skilled Worker'],[prefix+' seasonal','York','Seasonal Worker']]){
    const r=await prisma.sponsor.create({data:{snapshotId:snapshot.id,companyName:name,companyNameNorm:name,townCity:town,route,ratingType:'Worker (A rating)'}});sponsorIds.push(r.id);
   }
   assert.equal((await sponsorEvidence(prefix+' shared')).status,'AMBIGUOUS');
   assert.equal((await sponsorEvidence(prefix+' seasonal')).status,'OTHER_ROUTE_OR_RATING');
   assert.equal((await sponsorEvidence(prefix+' shared group')).status,'UNVERIFIED');
  });
  await t.test('bad snapshot does not replace the successful imported register',async()=>{
   const before=await prisma.sponsorSnapshot.count();await assert.rejects(()=>importRegister('Wrong,Columns\nA,B',new Date(),'https://example.com'));
   assert.equal(await prisma.sponsorSnapshot.count(),before);
  });
  await t.test('closed and stale jobs disappear from persisted shortlists',async()=>{
   const candidate=users[1];
   await prisma.shortlist.upsert({where:{userId_period:{userId:candidate.id,period:require('../src/lib/domain').shortlistPeriod(true)}},create:{userId:candidate.id,period:require('../src/lib/domain').shortlistPeriod(true),jobIds:[job.id]},update:{}});
   assert.equal((await shortlist(candidate)).length,1);
   await prisma.job.update({where:{id:job.id},data:{closedAt:new Date()}});assert.equal((await shortlist(candidate)).length,0);
   await prisma.job.update({where:{id:job.id},data:{closedAt:null,lastCheckedAt:new Date(Date.now()-8*86400000)}});assert.equal((await shortlist(candidate)).length,0);
  });
  await t.test('private document reads and deletes require ownership before storage access',async()=>{const docs=require('../src/app/api/documents/route');const doc=await prisma.cvProfile.create({data:{userId:users[0].id,rawFileUrl:'cv/'+users[0].id+'/fixture.pdf',parsedJson:{status:'READY'}}});active=users[1];assert.equal((await docs.GET(new Request('http://localhost/api/documents?id='+doc.id))).status,404);assert.equal((await docs.DELETE(request({id:doc.id}))).status,404);await prisma.cvProfile.delete({where:{id:doc.id}});active=users[0];});
  await t.test('billing portal works with no sale price or enabled pilot',async()=>{const stripeModule=require('../src/lib/stripe');const billing=require('../src/app/api/billing/route');await prisma.user.update({where:{id:active.id},data:{stripeCustomerId:prefix+'-customer'}});process.env.STRIPE_SECRET_KEY='test-placeholder';process.env.APP_URL='http://localhost:3000';delete process.env.STRIPE_PRICE_PLUS;process.env.PAID_PILOT_ENABLED='false';const stub=mock.method(stripeModule,'getStripe',()=>({billingPortal:{sessions:{create:async()=>({url:'https://billing.stripe.com/test'})}},prices:{retrieve:()=>{throw Error('Must not fetch sale price');}}}));try{const response=await billing.POST(request({action:'portal'}));assert.equal(response.status,200);assert.equal((await response.json()).url,'https://billing.stripe.com/test');}finally{stub.mock.restore();}});
  await t.test('billing uses current customer state, including cancellation and out-of-order events',async()=>{
   const {syncSubscription}=require('../src/lib/stripe');
   await prisma.user.update({where:{id:active.id},data:{stripeCustomerId:prefix+'-customer'}});
   process.env.STRIPE_PRICE_PLUS='price_fixture_plus';
   let subscriptions=[{id:'current',status:'active',current_period_end:Math.floor(Date.now()/1000)+86400,items:{data:[{price:{id:'price_fixture_plus'}}]}}];
   const fake={subscriptions:{retrieve:async()=>({customer:prefix+'-customer'}),list:async()=>({data:subscriptions})}};
   await syncSubscription('an-old-canceled-event',fake);
   assert.equal((await prisma.user.findUniqueOrThrow({where:{id:active.id}})).subscriptionTier,'PLUS');
   subscriptions=[];await syncSubscription('current',fake);
   assert.equal((await prisma.user.findUniqueOrThrow({where:{id:active.id}})).subscriptionTier,'FREE');
   assert.ok(await prisma.application.count({where:{userId:active.id}})>0);
  });
  await t.test('account deletion is retryable and cascades private data only after external work succeeds',async()=>{
   const {deleteAccount}=require('../src/lib/deletion');
   const u=await prisma.user.create({data:{clerkId:prefix+'delete',email:prefix+'delete@example.com',stripeCustomerId:prefix+'delete-customer'}});users.push(u);
   await prisma.approvedFact.create({data:{userId:u.id,title:'Private fact',body:'Private example',approvedAt:new Date()}});
   let identityDeleted=false;
   await assert.rejects(()=>deleteAccount(u.id,{cancelSubscriptions:async()=>{throw new Error('Provider outage');},deleteIdentity:async()=>{identityDeleted=true;}}));
   assert.equal(identityDeleted,false);assert.ok((await prisma.user.findUniqueOrThrow({where:{id:u.id}})).deletingAt);
   await deleteAccount(u.id,{cancelSubscriptions:async()=>{},deleteIdentity:async()=>{identityDeleted=true;}});
   assert.equal(identityDeleted,true);assert.equal(await prisma.user.findUnique({where:{id:u.id}}),null);assert.equal(await prisma.approvedFact.count({where:{userId:u.id}}),0);
  });
  await t.test('Lever filters non-UK roles and preserves listings on failures',async()=>{
   const oldFetch=global.fetch,oldLever=process.env.LEVER_BOARDS,oldGreenhouse=process.env.GREENHOUSE_BOARDS;
   process.env.LEVER_BOARDS=JSON.stringify([{token:prefix,company:prefix,approved:true}]);process.env.GREENHOUSE_BOARDS='[]';process.env.ADZUNA_COMMERCIAL_USE_APPROVED='false';
   try{global.fetch=async()=>new Response(JSON.stringify([{id:'uk',text:'Graduate Data Analyst',hostedUrl:'https://jobs.lever.co/'+prefix+'/uk',createdAt:Date.now(),descriptionPlain:'We offer visa sponsorship.',categories:{location:'London, UK'}},{id:'us',text:'Graduate Data Analyst',hostedUrl:'https://jobs.lever.co/'+prefix+'/us',descriptionPlain:'Data role',categories:{location:'New York, USA'}}]));
    const result=await ingestJobs(undefined,true);assert.equal(result.seen,1);const listing=await prisma.job.findUniqueOrThrow({where:{source_externalId:{source:'lever:'+prefix,externalId:'uk'}}});jobIds.push(listing.id);assert.equal(listing.vacancyPolicy,'OFFERED');assert.equal(listing.licenceStatus,'UNVERIFIED');
    global.fetch=async()=>new Response('',{status:503});assert.equal((await ingestJobs(undefined,true)).failures.length,1);assert.equal((await prisma.job.findUniqueOrThrow({where:{id:listing.id}})).closedAt,null);
    global.fetch=async()=>new Response('[]');await ingestJobs(undefined,true);assert.ok((await prisma.job.findUniqueOrThrow({where:{id:listing.id}})).closedAt);
   }finally{global.fetch=oldFetch;process.env.LEVER_BOARDS=oldLever??'[]';process.env.GREENHOUSE_BOARDS=oldGreenhouse??'[]';}
  });
  await t.test('historical rows are removed only after a verified archive round trip',async()=>{
   const {archiveRegister}=require('../src/lib/registerArchive');const snap=await prisma.sponsorSnapshot.create({data:{sourceDate:new Date('2001-01-01'),sourceUrl:'https://example.com/fixture',checksum:prefix+'-archive',rowCount:1}});
   await prisma.sponsor.create({data:{snapshotId:snap.id,companyName:'Archive fixture',companyNameNorm:'archive fixture',route:'Skilled Worker'}});
   let saved:Buffer=Buffer.alloc(0);const storage={save:async(_path:string,bytes:Buffer)=>{saved=bytes;},read:async():Promise<Buffer>=>Buffer.from('corrupt')};
   try{await assert.rejects(()=>archiveRegister(storage));assert.equal(await prisma.sponsor.count({where:{snapshotId:snap.id}}),1);storage.read=async()=>saved;const result=await archiveRegister(storage);assert.equal(result.archived,true);assert.equal(await prisma.sponsor.count({where:{snapshotId:snap.id}}),0);assert.ok((await prisma.sponsorSnapshot.findUniqueOrThrow({where:{id:snap.id}})).archiveChecksum);
   }finally{await prisma.sponsorSnapshot.delete({where:{id:snap.id}});}
  });
  await t.test('full-source closure differs from a source outage',async()=>{
   const oldFetch=global.fetch,oldBoards=process.env.GREENHOUSE_BOARDS;
   process.env.GREENHOUSE_BOARDS=JSON.stringify([{token:prefix,company:prefix,approved:true}]);process.env.ADZUNA_COMMERCIAL_USE_APPROVED='false';
   await prisma.jobSource.create({data:{jobId:job.id,source:'greenhouse:'+prefix,externalId:prefix,url:job.url,lastSeenAt:new Date(Date.now()-86400000)}});
   try{
    global.fetch=async()=>new Response('',{status:503});await ingestJobs();assert.equal((await prisma.job.findUniqueOrThrow({where:{id:job.id}})).closedAt,null);
    global.fetch=async()=>new Response(JSON.stringify({jobs:[]}),{status:200});await ingestJobs();assert.ok((await prisma.job.findUniqueOrThrow({where:{id:job.id}})).closedAt);
   }finally{global.fetch=oldFetch;process.env.GREENHOUSE_BOARDS=oldBoards??'[]';}
  });
 }finally{
  mock.restoreAll();
  await prisma.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
  await prisma.job.deleteMany({where:{id:{in:jobIds}}});
  await prisma.sponsor.deleteMany({where:{id:{in:sponsorIds}}});
  await prisma.$disconnect();
 }
});
