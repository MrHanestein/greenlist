import { put,get } from '@vercel/blob';
import { createHash } from 'node:crypto';
import { gzipSync,gunzipSync } from 'node:zlib';
import { prisma } from './prisma';
const hash=(data:Uint8Array)=>createHash('sha256').update(data).digest('hex');
// Archive one historical snapshot per daily run. Never remove the latest successful register.
type ArchiveStorage={save:(path:string,bytes:Buffer)=>Promise<void>;read:(path:string)=>Promise<Buffer>};
export async function archiveRegister(storage?:ArchiveStorage){
 if(!storage&&!process.env.BLOB_READ_WRITE_TOKEN&&!process.env.BLOB_STORE_ID)return {archived:false,reason:'Private storage is not configured'};
 const files:ArchiveStorage=storage??{async save(path,bytes){await put(path,bytes,{access:'private',contentType:'application/gzip',addRandomSuffix:false,abortSignal:AbortSignal.timeout(30000)});},async read(path){const remote=await get(path,{access:'private',useCache:false});if(!remote||remote.statusCode!==200)throw new Error('Archive verification failed');return Buffer.from(await new Response(remote.stream).arrayBuffer());}};
 const latest=await prisma.sponsorSnapshot.findFirst({orderBy:{sourceDate:'desc'}});if(!latest)return {archived:false};
 const snapshot=await prisma.sponsorSnapshot.findFirst({where:{id:{not:latest.id},sourceDate:{lt:new Date(Date.now()-30*86400000)},archivedAt:null},orderBy:{sourceDate:'asc'}});if(!snapshot)return {archived:false};
 const rows=await prisma.sponsor.findMany({where:{snapshotId:snapshot.id},orderBy:{id:'asc'}});
 if(rows.length!==snapshot.rowCount)throw new Error('Historical register row count does not match');
 const compressed=gzipSync(Buffer.from(JSON.stringify({format:'greenlist-register-rows-v1',snapshot,rows}))),checksum=hash(compressed),pathname='register-archives/'+snapshot.id+'/'+checksum+'.json.gz';
 await files.save(pathname,compressed);
 const downloaded=await files.read(pathname);
 if(hash(downloaded)!==checksum||JSON.parse(gunzipSync(downloaded).toString()).rows.length!==snapshot.rowCount)throw new Error('Archive checksum verification failed');
 await prisma.$transaction(async tx=>{await tx.sponsorSnapshot.update({where:{id:snapshot.id},data:{archivePath:pathname,archiveChecksum:checksum,archivedAt:new Date()}});await tx.sponsor.deleteMany({where:{snapshotId:snapshot.id}});},{timeout:60000});
 return {archived:true,snapshotId:snapshot.id,rowCount:snapshot.rowCount};
}
