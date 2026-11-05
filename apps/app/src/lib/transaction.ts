import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
export async function serial<T>(fn:(tx:Prisma.TransactionClient)=>Promise<T>):Promise<T>{
 for(let attempt=0;attempt<4;attempt++){try{return await prisma.$transaction(fn,{isolationLevel:'Serializable',timeout:20000});}catch(e){if(!(e instanceof Prisma.PrismaClientKnownRequestError)||!['P2034','P2002'].includes(e.code)||attempt===3)throw e;}}
 throw new Error('Transaction retry exhausted');
}