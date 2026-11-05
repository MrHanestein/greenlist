import { put,get,del } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { endpoint,HttpError,body } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { serial } from '@/lib/transaction';
import { z } from 'zod';
const types:Record<string,string>={'application/pdf':'pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx','text/plain':'txt'};
function configured(){if(!process.env.BLOB_READ_WRITE_TOKEN&&!process.env.BLOB_STORE_ID)throw new HttpError(503,'Private document storage is not connected yet. You can still paste your CV in Profile.');}
export const GET=endpoint(async req=>{
 const u=await requireUser(),id=new URL(req.url).searchParams.get('id');
 if(!id)return {documents:await prisma.cvProfile.findMany({where:{userId:u.id,rawFileUrl:{not:null}},select:{id:true,label:true,createdAt:true,parsedJson:true},orderBy:{createdAt:'desc'}})};
 const doc=await prisma.cvProfile.findFirst({where:{id,userId:u.id}});if(!doc?.rawFileUrl?.startsWith('cv/'+u.id+'/'))throw new HttpError(404,'Document not found');
 configured();const result=await get(doc.rawFileUrl,{access:'private',useCache:false});if(!result||result.statusCode!==200)throw new HttpError(404,'Document is not available yet');
 return new Response(result.stream,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="greenlist-cv.'+(doc.rawFileUrl.split('.').pop()??'txt')+'"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
});
export const POST=endpoint(async req=>{
 const u=await requireUser();configured();const contentType=req.headers.get('content-type')?.split(';')[0]??'',ext=types[contentType];if(!ext)throw new HttpError(400,'Upload a PDF, DOCX or plain-text CV');
 const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'Choose a file');let size=0;const chunks:Uint8Array[]=[];
 while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>2*1024*1024){await reader.cancel();throw new HttpError(413,'Use a CV under 2 MB');}chunks.push(r.value);}
 const bytes=Buffer.concat(chunks);if(!size||(ext==='pdf'&&bytes.subarray(0,5).toString()!=='%PDF-')||(ext==='docx'&&bytes.subarray(0,2).toString()!=='PK'))throw new HttpError(400,'The file does not match its format');
 const id=randomUUID(),pathname='cv/'+u.id+'/'+id+'.'+ext;
 await serial(async tx=>{const fresh=await tx.user.findUniqueOrThrow({where:{id:u.id}});if(fresh.deletingAt)throw new HttpError(403,'Account deletion is in progress');if(await tx.cvProfile.count({where:{userId:u.id,rawFileUrl:{not:null}}})>=10)throw new HttpError(400,'Keep up to ten private CV files; remove an old file first');await tx.cvProfile.create({data:{id,userId:u.id,label:'CV '+new Date().toISOString().slice(0,10),rawFileUrl:pathname,isPrimary:false,parsedJson:{status:'UPLOADING',contentType,size}}});});
 try{await put(pathname,bytes,{access:'private',contentType,addRandomSuffix:false,abortSignal:AbortSignal.timeout(30000)});const user=await prisma.user.findUnique({where:{id:u.id}});if(!user||user.deletingAt)throw new Error('Account unavailable');await prisma.cvProfile.update({where:{id},data:{parsedJson:{status:'READY',contentType,size}}});return {id};}
 catch{await del(pathname);await prisma.cvProfile.deleteMany({where:{id,userId:u.id}});throw new HttpError(502,'Upload could not be completed. Please try again.');}
});
export const DELETE=endpoint(async req=>{const u=await requireUser(),{id}=await body(req,z.object({id:z.string()}));const doc=await prisma.cvProfile.findFirst({where:{id,userId:u.id}});if(!doc?.rawFileUrl?.startsWith('cv/'+u.id+'/'))throw new HttpError(404,'Document not found');configured();await del(doc.rawFileUrl);await prisma.cvProfile.delete({where:{id}});return {ok:true};});
