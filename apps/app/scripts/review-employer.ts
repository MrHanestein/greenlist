import { z } from 'zod';
import { prisma } from '../src/lib/prisma';
import { normaliseEmployer } from '../src/lib/domain';
async function main(){
 const [legalName,townCity,alias,evidenceUrl]=process.argv.slice(2);
 const data=z.object({legalName:z.string().min(2),townCity:z.string().min(1),alias:z.string().min(2),evidenceUrl:z.string().url().startsWith('https://')}).parse({legalName,townCity,alias,evidenceUrl});
 const employer=await prisma.employer.upsert({where:{legalNameNorm:normaliseEmployer(data.legalName)},create:{legalName:data.legalName,legalNameNorm:normaliseEmployer(data.legalName),townCity:data.townCity,reviewedAt:new Date()},update:{townCity:data.townCity,reviewedAt:new Date()}});
 const existing=await prisma.employerAlias.findUnique({where:{aliasNorm:normaliseEmployer(alias)}});
 if(existing&&existing.employerId!==employer.id)throw new Error('Alias already points to a different employer; review manually');
 await prisma.employerAlias.upsert({where:{aliasNorm:normaliseEmployer(alias)},create:{aliasNorm:normaliseEmployer(alias),employerId:employer.id,evidenceUrl,reviewedAt:new Date()},update:{evidenceUrl,reviewedAt:new Date()}});
 console.log('Reviewed employer identity saved');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());