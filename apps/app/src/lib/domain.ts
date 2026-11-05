export type VacancyPolicy = 'OFFERED' | 'CONDITIONAL' | 'NOT_OFFERED' | 'UNKNOWN';
export const EVIDENCE_VERSION = 2;
export const normaliseEmployer = (name: string) => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-GB');
export const plainText = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// Positive evidence is deliberately narrow. Contradictions always remain unknown.
export function vacancyEvidence(description: string): { policy: VacancyPolicy; quote: string | null; warnings: string[] } {
  const text = plainText(description);
  const sentences = text.match(/[^.!?]+[.!?]?/g) ?? [];
  const negative = sentences.find(s => /(?:no (?:visa )?sponsorship|(?:cannot|can't|unable to|do not|does not|will not|won't)\s+(?:offer|provide|support)\s+(?:visa )?sponsorship|sponsorship (?:is )?not (?:available|offered|provided))/i.test(s));
  const positive = sentences.find(s => /^\s*(?:we (?:offer|provide) (?:skilled worker |visa )?sponsorship|(?:visa |skilled worker )sponsorship (?:is )?(?:available|provided|offered))(?: for (?:this|the) (?:role|position))?\s*[.!]?\s*$/i.test(s));
  const warnings: string[] = [];
  const conditional = sentences.find(s => /sponsorship/i.test(s) && /\b(may|might|subject to|consider|eligible|eligibility|depending|case.by.case)\b/i.test(s));
  if (/fee applies|payment required to (?:start|train)|pay.to.train/i.test(text)) warnings.push('The advert mentions a fee or paid training. Check the terms before proceeding.');
  if (/guaranteed (?:job )?placement/i.test(text)) warnings.push('The advert makes a guaranteed-placement claim. Verify it independently.');
  if (positive && negative) return { policy: 'UNKNOWN', quote: `${positive.trim()} ${negative.trim()}`, warnings: [...warnings, 'The advert contains conflicting sponsorship statements. Ask the employer.'] };
  if (conditional && !negative) return { policy: 'CONDITIONAL', quote: conditional.trim(), warnings: [...warnings, 'Sponsorship depends on conditions. Confirm them with the employer.'] };
  return { policy: negative ? 'NOT_OFFERED' : positive ? 'OFFERED' : 'UNKNOWN', quote: (negative ?? positive)?.trim() ?? null, warnings };
}

export function ukGraduateRole(job: {title:string;location:string|null;description:string}) {
  if(/\b(new york|ontario|massachusetts|pennsylvania|california|british columbia|victoria|new south wales)\b|,\s*(?:MA|NY|CA|ON|BC|NSW)\s*$/i.test(job.location??''))return false;
  if (/\b(senior|principal|staff|lead|head|director|manager)\b/i.test(job.title)) return false;
  if(/\b[3-9]\+?\s+years?\s+(?:of\s+)?(?:professional\s+|commercial\s+)?experience\s+(?:is\s+)?(?:required|essential|minimum)\b/i.test(job.description))return false;
  if (!/\b(software|engineer|data|developer|analyst|computing|technology|cyber|product design|ux)\b/i.test(job.title)) return false;
  // Remote alone is not evidence that a role accepts UK-based applicants.
  return /\b(uk|united kingdom|great britain|england|scotland|wales|northern ireland|london|manchester|bristol|edinburgh|glasgow|belfast|leeds|birmingham|cambridge|oxford|nottingham|sheffield|newcastle|cardiff|reading|brighton|bath|york|liverpool|southampton|exeter|coventry|leicester|aberdeen|dundee|milton keynes)\b/i.test(job.location ?? '') && !/\b(usa|united states|canada|australia|india)\b/i.test(job.location ?? '');
}

const aliases:Record<string,string[]>={javascript:['javascript','js'],typescript:['typescript','ts'],postgresql:['postgresql','postgres'],react:['react','reactjs','react.js'],python:['python'],sql:['sql','postgresql','mysql','postgres']};
function mentions(text:string,term:string){return new RegExp('(^|[^a-z0-9])'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(text);}

export function canonicalUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('Only HTTPS job links are accepted');
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|ref$|source$|tracking)/i.test(key)) url.searchParams.delete(key);
  url.hash = '';
  return url.toString();
}

export function rankJob(job: { title: string; description: string; location: string | null; vacancyPolicy: string; salaryMin: number | null; lastCheckedAt: Date }, profile: { skills: string[]; targetRoles: string[]; preferredLocations: string[]; needsSponsorshipNow: boolean | null; needsSponsorshipFuture: boolean | null }) {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const matched = profile.skills.filter(s => (aliases[s.toLowerCase()] ?? [s]).some(term=>mentions(text,term)));
  const roleMatch = profile.targetRoles.some(r => job.title.toLowerCase().includes(r.toLowerCase()));
  const local = profile.preferredLocations.length === 0 || profile.preferredLocations.some(l => (job.location ?? '').toLowerCase().includes(l.toLowerCase()));
  const reasons = [matched.length ? `Skills mentioned: ${matched.join(', ')}` : 'No listed skill overlap found', roleMatch ? 'Matches a target role' : 'Check the role title', local ? 'Within your location preferences' : 'Outside your preferred locations'];
  let score = Math.min(50, matched.length * 10) + (roleMatch ? 25 : 0) + (local ? 15 : 0);
  if (/\b(senior|principal|staff|lead|head|director)\b/i.test(job.title)) { score -= 40; reasons.push('Title suggests experience beyond graduate level'); }
  if (profile.needsSponsorshipNow && job.vacancyPolicy === 'NOT_OFFERED') { score -= 70; reasons.push('Advert says sponsorship is not offered, conflicting with your current needs'); }
  else if (profile.needsSponsorshipFuture && job.vacancyPolicy === 'NOT_OFFERED') { score -= 10; reasons.push('Sponsorship is refused. Consider only if you can work now; there is no commitment to sponsor you later'); }
  if(job.vacancyPolicy==='CONDITIONAL')reasons.push('Sponsorship is conditional; ask whether the stated conditions fit your circumstances');
  if (job.vacancyPolicy === 'UNKNOWN') reasons.push('Sponsorship for this vacancy is unconfirmed');
  if (job.salaryMin === null) reasons.push('Salary is not disclosed; check with the employer');
  return { score: Math.max(0, Math.min(100, score)), reasons };
}

export function shortlistPeriod(plus: boolean, now = new Date()) {
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (!plus) day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return `${plus ? 'day' : 'week'}:${day.toISOString().slice(0, 10)}`;
}
export function packPeriod(plus: boolean, now = new Date(), subscriptionStart?:Date|null) { return plus ? subscriptionStart ? 'subscription:'+subscriptionStart.toISOString() : now.toISOString().slice(0, 7) : 'lifetime'; }
export function packLimit(plus: boolean) { return plus ? 40 : 3; }
export function isPlus(user: { subscriptionTier: string; subscriptionValidUntil: Date | null }) { return user.subscriptionTier === 'PLUS' && !!user.subscriptionValidUntil && user.subscriptionValidUntil > new Date(); }

export function buildPack(job: { title: string; company: string; description: string }, facts: { id: string; title: string; body: string }[], cvText: string) {
  const words = new Set(job.description.toLowerCase().match(/[a-z]{4,}/g));
  const relevant = facts.map(f => ({ ...f, overlap: (f.body.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter(w => words.has(w)).length })).sort((a,b) => b.overlap-a.overlap).slice(0, 4);
  return {
    approach: 'Evidence-based draft; review and personalise before use.',
    answers: relevant.map(f => ({ question: `Relevant experience: ${f.title}`, answer: f.body, factIds: [f.id] })),
    introduction: `I am applying for the ${job.title} position at ${job.company}.`,
    cvSuggestions: relevant.length ? relevant.map(f => `Consider highlighting your approved example “${f.title}” if it is relevant to this role. Keep its facts unchanged.`) : ['Add and approve a specific project or achievement in Application memory before preparing an application.'],
    cvText, factIds: relevant.map(f => f.id),
  };
}
