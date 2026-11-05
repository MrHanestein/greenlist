import { endpoint,requireCron } from '@/lib/http';
import { archiveRegister } from '@/lib/registerArchive';
import { prisma } from '@/lib/prisma';
export const maxDuration=300;
export const POST=endpoint(async req=>{requireCron(req);try{return await archiveRegister();}catch(e){await prisma.syncRun.create({data:{kind:'register-archive',status:'FAILED',message:'Archive failed verification or storage was unavailable. Source rows retained unless the archive transaction already completed.'}});throw e;}});
