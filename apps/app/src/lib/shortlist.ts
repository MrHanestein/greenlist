import { prisma } from './prisma';
import { isPlus,rankJob,shortlistPeriod,ukGraduateRole } from './domain';
import type { User } from '@prisma/client';
export async function shortlist(user:User) {
 if(user.searchStatus==='FOUND_JOB')return [];
 const period=shortlistPeriod(true);
 const existing=await prisma.shortlist.findUnique({where:{userId_period:{userId:user.id,period}}});
 if(existing) {
  const jobs=await prisma.job.findMany({where:{id:{in:existing.jobIds},closedAt:null,feedback:{none:{userId:user.id,kind:{in:['IRRELEVANT','ALREADY_APPLIED']}}},lastCheckedAt:{gte:new Date(Date.now()-7*86400000)},applications:{none:{userId:user.id,submittedAt:{not:null}}}}});
  return jobs.filter(ukGraduateRole).map(j=>({...j,...rankJob(j,user)})).sort((a,b)=>b.score-a.score);
 }
 if(!user.onboardedAt || user.searchStatus==='FOUND_JOB') return [];
 const limit=10;
 let selected:Awaited<ReturnType<typeof prisma.job.findMany>>[number][]=[];
 let cursor:string|undefined;
 // Keep only the best candidates in memory, but examine every fresh listing.
 do {
  const page=await prisma.job.findMany({where:{closedAt:null,lastCheckedAt:{gte:new Date(Date.now()-7*86400000)},...(cursor?{id:{gt:cursor}}:{}),feedback:{none:{userId:user.id,kind:{in:['IRRELEVANT','ALREADY_APPLIED']}}},applications:{none:{userId:user.id,submittedAt:{not:null}}}},orderBy:{id:'asc'},take:250});
  const eligible=page.filter(j=>ukGraduateRole(j)&& !(user.needsSponsorshipNow && j.vacancyPolicy==='NOT_OFFERED')).map(j=>({...j,...rankJob(j,user)})).filter(j=>j.score>=25);
  selected=[...selected,...eligible].sort((a,b)=>rankJob(b,user).score-rankJob(a,user).score || b.postedAt.getTime()-a.postedAt.getTime()).slice(0,limit);
  cursor=page.length===250?page[page.length-1].id:undefined;
 }while(cursor);
 // An empty feed must not lock the user out when a source subsequently recovers.
 if(selected.length) {
  const saved=await prisma.shortlist.upsert({where:{userId_period:{userId:user.id,period}},create:{userId:user.id,period,jobIds:selected.map(j=>j.id)},update:{}});
  // A concurrent creator may have selected a different set during a feed update.
  return selected.filter(job=>saved.jobIds.includes(job.id)).map(j=>({...j,...rankJob(j,user)}));
 }
 return selected.map(j=>({...j,...rankJob(j,user)}));
}
