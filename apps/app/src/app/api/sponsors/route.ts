import { endpoint } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { normaliseEmployer } from '@/lib/domain';
export const GET=endpoint(async req=>{
 const q=new URL(req.url).searchParams.get('q')?.trim() ?? '';
 const snapshot=await prisma.sponsorSnapshot.findFirst({orderBy:{sourceDate:'desc'}});
 const sponsors=snapshot && q.length>=2 && q.length<=100 ? await prisma.sponsor.findMany({where:{snapshotId:snapshot.id,companyNameNorm:{contains:normaliseEmployer(q)}},take:30,orderBy:{companyName:'asc'},select:{id:true,companyName:true,townCity:true,route:true,ratingType:true}}):[];
 return {snapshot,sponsors,note:'A sponsor licence does not mean a particular vacancy offers sponsorship.'};
});