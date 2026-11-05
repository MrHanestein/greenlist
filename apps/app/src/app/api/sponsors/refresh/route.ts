import { endpoint,requireCron } from '@/lib/http';
import { refreshRegister } from '@/lib/register';
import { prisma } from '@/lib/prisma';
export const maxDuration=300;
export const POST=endpoint(async req=>{requireCron(req);try{const snapshot=await refreshRegister();await prisma.syncRun.create({data:{kind:'register',status:'SUCCESS',message:snapshot.rowCount+' rows'}});return {snapshot};}catch(e){await prisma.syncRun.create({data:{kind:'register',status:'FAILED',message:'Previous snapshot retained'}});throw e;}});