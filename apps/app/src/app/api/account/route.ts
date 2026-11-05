import { z } from 'zod';
import { body,endpoint,HttpError } from '@/lib/http';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/user';
import { deleteAccount } from '@/lib/deletion';
export const GET=endpoint(async()=>{const u=await requireUser();return {learning:await prisma.learningProgress.findUnique({where:{userId:u.id}}),profile:u,documents:await prisma.cvProfile.findMany({where:{userId:u.id},select:{id:true,label:true,createdAt:true}}),facts:await prisma.approvedFact.findMany({where:{userId:u.id}}),applications:await prisma.application.findMany({where:{userId:u.id},include:{versions:true,events:true}}),packs:await prisma.applicationPack.findMany({where:{userId:u.id},include:{revisions:true}}),feedback:await prisma.jobFeedback.findMany({where:{userId:u.id}}),activity:await prisma.productEvent.findMany({where:{userId:u.id}})};});
export const DELETE=endpoint(async req=>{
 const {userId:clerkId}=await auth();if(!clerkId)throw new HttpError(401,'Sign in to continue');
 await body(req,z.object({confirmation:z.literal('DELETE')}));
 const u=await prisma.user.findUnique({where:{clerkId}});
 if(u)await deleteAccount(u.id);
 return {deleted:true};
});