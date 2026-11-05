// Read-only register research export. Never creates reviewed employers or enables feeds.
process.loadEnvFile('.env');
const {PrismaClient}=require('@prisma/client');const fs=require('node:fs');const path=require('node:path');
const db=new PrismaClient();
async function main(){
 const snapshot=await db.sponsorSnapshot.findFirstOrThrow({orderBy:{sourceDate:'desc'}});
 const rows=await db.sponsor.findMany({where:{snapshotId:snapshot.id,route:'Skilled Worker',ratingType:'Worker (A rating)',OR:['software','technology','technologies','data','digital','computing'].map(term=>({companyName:{contains:term,mode:'insensitive'}}))},distinct:['companyNameNorm'],orderBy:{companyNameNorm:'asc'},take:100});
 const candidates=rows.map(r=>({legalName:r.companyName,town:r.townCity,route:r.route,rating:r.ratingType,snapshotDate:snapshot.sourceDate.toISOString().slice(0,10),registerSource:snapshot.sourceUrl,website:null,careersUrl:null,boardProvider:null,boardToken:null,identityReview:'PENDING',permissionStatus:'NOT_REQUESTED',feedEnabled:false,graduateDataCoverage:'UNKNOWN'}));
 const out=path.resolve('../../docs/research');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'employer-candidates.json'),JSON.stringify(candidates,null,2));
 const escape=s=>String(s??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
 fs.writeFileSync(path.join(out,'EMPLOYER-CANDIDATES.md'),`# Employer research queue\n\nGenerated ${new Date().toISOString().slice(0,10)} from register snapshot ${snapshot.sourceDate.toISOString().slice(0,10)}.\n\nThese ${rows.length} keyword-selected legal names are research candidates, not verified careers-site identities or confirmed graduate employers. Website, careers page, board identity and commercial permission remain pending. No feeds were enabled. A licence is not a vacancy sponsorship offer.\n\n| Legal name in register | Town | Identity/careers review | Feed permission |\n|---|---|---|---|\n`+candidates.map(r=>`| ${escape(r.legalName)} | ${escape(r.town)} | Pending | Not requested |`).join('\n')+'\n');
 console.log(JSON.stringify({candidates:candidates.length,snapshot:snapshot.sourceDate,reviewedEmployers:await db.employer.count(),liveJobs:await db.job.count({where:{closedAt:null}})}));
}
main().finally(()=>db.$disconnect());
