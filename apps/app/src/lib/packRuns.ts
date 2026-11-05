import { prisma } from './prisma';
import { serial } from './transaction';
// Expired calls may have reached the provider: retain cost reservation, refund the user's pack.
export async function recoverPackRuns(){
 const expired=await prisma.aiRun.findMany({where:{status:'PENDING',expiresAt:{lt:new Date()}},take:100});
 for(const run of expired)await serial(async tx=>{const claim=await tx.aiRun.updateMany({where:{id:run.id,status:'PENDING'},data:{status:'FAILED'}});if(claim.count)await tx.usage.updateMany({where:{userId:run.userId,period:run.period,kind:run.kind,count:{gt:0}},data:{count:{decrement:1}}});});
}
