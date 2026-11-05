import { endpoint,requireCron } from '@/lib/http';
import { ingestJobs } from '@/lib/ingest';
export const maxDuration=300;
export const POST=endpoint(async req=>{requireCron(req);return ingestJobs(new URL(req.url).searchParams.get('cursor')??undefined,true);});