import { z } from 'zod';
import { body,endpoint,HttpError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
const schema=z.object({id:z.string().optional(),title:z.string().trim().min(3).max(120),body:z.string().trim().min(10).max(3000),approved:z.literal(true)});
export const GET=endpoint(async()=>{const u=await requireUser();return {facts:await prisma.approvedFact.findMany({where:{userId:u.id},orderBy:{updatedAt:'desc'}})};});
export const POST=endpoint(async req=>{const u=await requireUser();const input=await body(req,schema);const data={title:input.title,body:input.body,approvedAt:new Date()};if(input.id){const result=await prisma.approvedFact.updateMany({where:{id:input.id,userId:u.id},data});if(!result.count)throw new HttpError(404,'Example not found');return {ok:true};}if(await prisma.approvedFact.count({where:{userId:u.id}})>=100)throw new HttpError(400,'You can keep up to 100 approved examples');return {fact:await prisma.approvedFact.create({data:{...data,userId:u.id}})};});
export const DELETE=endpoint(async req=>{const u=await requireUser();const {id}=await body(req,z.object({id:z.string()}));await prisma.approvedFact.deleteMany({where:{id,userId:u.id}});return {ok:true};});