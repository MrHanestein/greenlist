import { endpoint } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { issueAutofillToken } from '@/lib/autofillToken';
import { prisma } from '@/lib/prisma';
export const POST=endpoint(async()=>{const u=await requireUser();return {token:await issueAutofillToken(u.id,u.extensionVersion),expiresInDays:7};});
export const DELETE=endpoint(async()=>{const u=await requireUser();await prisma.user.update({where:{id:u.id},data:{extensionVersion:{increment:1}}});return {revoked:true};});