import { createHash } from 'node:crypto';
import { z } from 'zod';
import { prisma } from './prisma';
import { canonicalUrl,normaliseEmployer,plainText,vacancyEvidence,EVIDENCE_VERSION,ukGraduateRole } from './domain';
import { sponsorEvidence } from './sponsorMatch';
type Listing={externalId:string;source:string;title:string;company:string;location:string;description:string;url:string;postedAt:Date;salaryMin:number|null;salaryMax:number|null};
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
async function store(listing:Listing){
 const url=canonicalUrl(listing.url), description=plainText(listing.description);
 const contentHash=hash(description);
 // Identical text can belong to different requisitions. Merge only a shared canonical link.
 const canonicalKey=hash(url);
 const previousSource=await prisma.jobSource.findUnique({where:{source_externalId:{source:listing.source,externalId:listing.externalId}},include:{job:true}});
 const existing=previousSource?.job ?? await prisma.job.findUnique({where:{source_externalId:{source:listing.source,externalId:listing.externalId}}}) ?? await prisma.job.findFirst({where:{OR:[{url},{sources:{some:{url}}}]}});
 const evidence=existing?.contentHash===contentHash && existing.evidenceVersion===EVIDENCE_VERSION ? {policy:existing.vacancyPolicy,quote:existing.evidenceQuote,warnings:existing.warnings} : vacancyEvidence(description);
 const licence=await sponsorEvidence(listing.company);
 const data={title:listing.title,company:listing.company,companyNorm:normaliseEmployer(listing.company),location:listing.location,description,url,salaryMin:listing.salaryMin,salaryMax:listing.salaryMax,contentHash,vacancyPolicy:evidence.policy,evidenceQuote:evidence.quote,warnings:evidence.warnings,licenceStatus:licence.status,licenceEvidence:licence,employerId:licence.employerId,lastCheckedAt:new Date(),evidenceCheckedAt:existing?.contentHash===contentHash&&existing.evidenceVersion===EVIDENCE_VERSION?existing.evidenceCheckedAt:new Date(),closedAt:null,isSponsor:false,isBlacklisted:false};
 await prisma.$transaction(async tx=>{
  const job=existing ? await tx.job.update({where:{id:existing.id},data:{...data,canonicalKey,evidenceVersion:EVIDENCE_VERSION}}) : await tx.job.create({data:{...data,evidenceVersion:EVIDENCE_VERSION,canonicalKey,source:listing.source,externalId:listing.externalId,postedAt:listing.postedAt}});
  await tx.jobSource.upsert({where:{source_externalId:{source:listing.source,externalId:listing.externalId}},create:{jobId:job.id,source:listing.source,externalId:listing.externalId,url},update:{url,lastSeenAt:new Date(),closedAt:null}});
 });
}
export async function ingestJobs(cursor?:string,batch=false){
 const reviewed=await prisma.employer.findMany({where:{feedApproved:true,permissionEvidenceUrl:{not:null},boardToken:{not:null}}});
 const boards=z.array(z.object({token:z.string().regex(/^[a-zA-Z0-9_-]+$/),company:z.string().min(1),approved:z.boolean()})).parse(JSON.parse(process.env.GREENHOUSE_BOARDS ?? '[]'));
 for(const e of reviewed.filter(e=>e.boardProvider==='greenhouse'))if(!boards.some(b=>b.token===e.boardToken))boards.push({token:e.boardToken!,company:e.legalName,approved:true});
 const leverBoards=z.array(z.object({token:z.string().regex(/^[a-zA-Z0-9_-]+$/),company:z.string().min(1),approved:z.boolean()})).parse(JSON.parse(process.env.LEVER_BOARDS??'[]'));
 for(const e of reviewed.filter(e=>e.boardProvider==='lever'))if(!leverBoards.some(b=>b.token===e.boardToken))leverBoards.push({token:e.boardToken!,company:e.legalName,approved:true});

 const sourceNames=[...(process.env.ADZUNA_COMMERCIAL_USE_APPROVED==='true'&&process.env.ADZUNA_APP_ID&&process.env.ADZUNA_APP_KEY&&process.env.NEXT_PUBLIC_ADZUNA_LOGO_URL?['adzuna']:[]),...boards.filter(b=>b.approved).map(b=>'greenhouse:'+b.token),...leverBoards.filter(b=>b.approved).map(b=>'lever:'+b.token)].sort();
 const selected=batch?sourceNames.find(s=>!cursor||s>cursor):undefined;
 const permits=(source:string)=>!batch||source===selected;
 let seen=0; const failures:string[]=[];let configured=0;
 if(permits('adzuna') && process.env.ADZUNA_COMMERCIAL_USE_APPROVED==='true' && process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY && process.env.NEXT_PUBLIC_ADZUNA_LOGO_URL){
  configured++;
  try{
   const pages=Math.min(10,Math.max(1,Number(process.env.ADZUNA_MAX_PAGES ?? 2)));
   for(let page=1;page<=pages;page++){
    const url=new URL('https://api.adzuna.com/v1/api/jobs/gb/search/'+page);
    url.search=new URLSearchParams({app_id:process.env.ADZUNA_APP_ID,app_key:process.env.ADZUNA_APP_KEY,results_per_page:'50',category:'it-jobs',sort_by:'date'}).toString();
    const res=await fetch(url,{signal:AbortSignal.timeout(30000),cache:'no-store'});
    if(!res.ok)throw new Error('Adzuna failed');
    const result=z.object({results:z.array(z.object({id:z.union([z.string(),z.number()]),title:z.string(),description:z.string(),company:z.object({display_name:z.string()}),location:z.object({display_name:z.string()}),redirect_url:z.string().url(),created:z.string().datetime({offset:true}),salary_min:z.number().optional(),salary_max:z.number().optional(),salary_is_predicted:z.union([z.string(),z.number()]).optional()}))}).parse(await res.json());
    for(const r of result.results){await store({source:'adzuna',externalId:String(r.id),title:r.title,company:r.company.display_name,location:r.location.display_name,description:r.description,url:r.redirect_url,postedAt:new Date(r.created),salaryMin:String(r.salary_is_predicted)==='1'?null:r.salary_min?Math.round(r.salary_min):null,salaryMax:String(r.salary_is_predicted)==='1'?null:r.salary_max?Math.round(r.salary_max):null});seen++;}
    if(result.results.length<50)break;
   }
  }catch{failures.push('Adzuna refresh failed; existing jobs retained');}
 }
 for(const board of boards.filter(b=>b.approved&&permits('greenhouse:'+b.token))){
  configured++;const source='greenhouse:'+board.token;const runStart=new Date();
  try{
   const res=await fetch('https://boards-api.greenhouse.io/v1/boards/'+board.token+'/jobs?content=true',{signal:AbortSignal.timeout(30000),cache:'no-store'});
   if(!res.ok)throw new Error('Greenhouse failed');
   const payload=z.object({jobs:z.array(z.object({id:z.number(),title:z.string(),content:z.string(),absolute_url:z.string().url(),updated_at:z.string().datetime({offset:true}),location:z.object({name:z.string()})}))}).parse(await res.json());
   for(const r of payload.jobs){if(!ukGraduateRole({title:r.title,location:r.location.name,description:r.content}))continue;await store({source,externalId:String(r.id),title:r.title,company:board.company,location:r.location.name,description:r.content,url:r.absolute_url,postedAt:new Date(r.updated_at),salaryMin:null,salaryMax:null});seen++;}
   // Only a successful, complete employer feed can confirm removal.
   await prisma.jobSource.updateMany({where:{source,lastSeenAt:{lt:runStart},closedAt:null},data:{closedAt:new Date()}});
  }catch{failures.push('Greenhouse '+board.token+' failed; existing jobs retained');}
 }
 for(const board of leverBoards.filter(b=>b.approved&&permits('lever:'+b.token))){
  configured++;const source='lever:'+board.token,runStart=new Date();
  try{
   let skip=0;
   do{
    const res=await fetch('https://api.lever.co/v0/postings/'+board.token+'?mode=json&limit=100&skip='+skip,{signal:AbortSignal.timeout(30000),cache:'no-store'});
    if(!res.ok)throw new Error('Lever failed');
    const rows=z.array(z.object({id:z.string(),text:z.string(),hostedUrl:z.string().url(),createdAt:z.number().optional(),descriptionPlain:z.string(),additionalPlain:z.string().optional(),lists:z.array(z.object({text:z.string(),content:z.string()})).optional(),categories:z.object({location:z.string().optional()})})).parse(await res.json());
    for(const r of rows){const description=[r.descriptionPlain,...(r.lists??[]).map(l=>l.text+' '+l.content),r.additionalPlain??''].join('\n');const location=r.categories.location??'';if(!ukGraduateRole({title:r.text,location,description}))continue;await store({source,externalId:r.id,title:r.text,company:board.company,location,description,url:r.hostedUrl,postedAt:r.createdAt?new Date(r.createdAt):new Date(),salaryMin:null,salaryMax:null});seen++;}
    if(rows.length<100)break;skip+=100;if(skip>=10000)throw new Error('Incomplete feed');
   }while(true);
   await prisma.jobSource.updateMany({where:{source,lastSeenAt:{lt:runStart},closedAt:null},data:{closedAt:new Date()}});
  }catch{failures.push('Lever '+board.token+' failed; existing jobs retained');}
 }
 await prisma.job.updateMany({where:{sources:{some:{},every:{closedAt:{not:null}}},closedAt:null},data:{closedAt:new Date()}});
 await prisma.syncRun.create({data:{kind:'jobs',status:failures.length?'PARTIAL':configured?'SUCCESS':'NOT_CONFIGURED',message:configured ? seen+' listings checked. '+failures.join('; '):'Connect an approved job source to populate the shortlist'}});
 return {seen,failures,configured,nextCursor:batch&&selected&&sourceNames.some(s=>s>selected)?selected:null};
}
