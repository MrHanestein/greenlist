import { prisma } from './prisma';
import { normaliseEmployer } from './domain';
export const normalizeCompanyName = normaliseEmployer;
export async function sponsorEvidence(name: string) {
 const snapshot = await prisma.sponsorSnapshot.findFirst({ orderBy: [{sourceDate:'desc'},{importedAt:'desc'}] });
 if (!snapshot) return { status:'UNVERIFIED', employerId:null, snapshotDate:null, records:[] };
 const norm = normaliseEmployer(name);
 const alias = await prisma.employerAlias.findUnique({ where:{aliasNorm:norm}, include:{employer:true} });
 const employer = alias?.employer ?? await prisma.employer.findUnique({where:{legalNameNorm:norm}});
 const records = await prisma.sponsor.findMany({where:{snapshotId:snapshot.id, companyNameNorm:employer?.legalNameNorm ?? norm}});
 const identities = new Set(records.map(r => normaliseEmployer(r.companyName)+'|'+normaliseEmployer(r.townCity ?? '')));
 const selected = employer?.townCity ? records.filter(r => normaliseEmployer(r.townCity ?? '') === normaliseEmployer(employer.townCity!)) : records;
 const ambiguous = !employer?.townCity && identities.size > 1;
 return {status:ambiguous ? 'AMBIGUOUS' : selected.some(r=>r.route==='Skilled Worker' && r.ratingType==='Worker (A rating)') ? 'LICENSED' : selected.length ? 'OTHER_ROUTE_OR_RATING' : 'UNVERIFIED', employerId:employer?.id ?? null, snapshotDate:snapshot.sourceDate.toISOString(), records:selected.map(r=>({name:r.companyName,town:r.townCity,route:r.route,rating:r.ratingType})), sourceUrl:snapshot.sourceUrl};
}