import { createHash } from 'node:crypto';
import { parse } from 'csv-parse/sync';
import { prisma } from './prisma';
import { normaliseEmployer } from './domain';
export const REGISTER_URL='https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers';
export function parseRegister(csv:string) {
 const rows=parse(csv,{columns:true,bom:true,skip_empty_lines:true}) as Record<string,string>[];
 const required=['Organisation Name','Town/City','County','Type & Rating','Route'];
 if (!rows.length || required.some(k=>!(k in rows[0]))) throw new Error('Register columns do not match');
 if (rows.some(r=>!r['Organisation Name']?.trim() || !r.Route?.trim())) throw new Error('Invalid register row');
 return rows.map(r=>({companyName:r['Organisation Name'],companyNameNorm:normaliseEmployer(r['Organisation Name']),townCity:r['Town/City'],county:r.County,route:r.Route,ratingType:r['Type & Rating']}));
}
export async function importRegister(csv:string,sourceDate:Date,sourceUrl:string) {
 const checksum=createHash('sha256').update(csv).digest('hex');
 const existing=await prisma.sponsorSnapshot.findUnique({where:{checksum}});
 if(existing) return existing;
 const rows=parseRegister(csv);
 const previous=await prisma.sponsorSnapshot.findFirst({orderBy:{sourceDate:'desc'}});
 if(rows.length<1000 || previous && rows.length<previous.rowCount*.8) throw new Error('Unexpected register size; previous snapshot retained for review');
 return prisma.$transaction(async tx=>{
  const snapshot=await tx.sponsorSnapshot.create({data:{checksum,sourceDate,sourceUrl,rowCount:rows.length}});
  for(let i=0;i<rows.length;i+=1000) await tx.sponsor.createMany({data:rows.slice(i,i+1000).map(r=>({...r,snapshotId:snapshot.id}))});
  return snapshot;
 },{timeout:180000,maxWait:15000});
}
export async function refreshRegister() {
 const page=await fetch(REGISTER_URL,{signal:AbortSignal.timeout(30000),cache:'no-store'});
 if(!page.ok) throw new Error('Register page unavailable');
 const html=await page.text();
 const links=[...html.matchAll(/href="([^"]+\.csv(?:\?[^"]*)?)"/gi)].map(m=>m[1].replace(/&amp;/g,'&'));
 const link=links.find(u=>/Worker/i.test(u));
 if(!link) throw new Error('Register CSV link not found');
 const url=new URL(link,REGISTER_URL);
 if(url.protocol!=='https:' || !['assets.publishing.service.gov.uk','www.gov.uk'].includes(url.hostname)) throw new Error('Unexpected download host');
 const date=url.pathname.match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);
 if(!date) throw new Error('Register date needs manual review');
 const res=await fetch(url,{signal:AbortSignal.timeout(60000),redirect:'error'});
 if(!res.ok) throw new Error('Register download failed');
 const csv=await res.text();
 if(csv.length>40000000) throw new Error('Register too large');
 return importRegister(csv,new Date(date[1]+'-'+date[2]+'-'+date[3]+'T00:00:00Z'),url.toString());
}