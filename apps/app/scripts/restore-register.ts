import { get } from '@vercel/blob';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { prisma } from '../src/lib/prisma';
async function main(){
 const id=process.argv[2];if(!id)throw new Error('Provide a snapshot ID; add --apply after checking the dry run');
 const snapshot=await prisma.sponsorSnapshot.findUniqueOrThrow({where:{id}});if(!snapshot.archivePath||!snapshot.archiveChecksum)throw new Error('Snapshot has no archive');
 const file=await get(snapshot.archivePath,{access:'private',useCache:false});if(!file||file.statusCode!==200)throw new Error('Archive is unavailable');
 const bytes=Buffer.from(await new Response(file.stream).arrayBuffer());if(createHash('sha256').update(bytes).digest('hex')!==snapshot.archiveChecksum)throw new Error('Archive checksum mismatch');
 const data=JSON.parse(gunzipSync(bytes).toString());if(data.format!=='greenlist-register-rows-v1'||data.snapshot.id!==id||data.rows.length!==snapshot.rowCount||data.rows.some((r:{snapshotId:string})=>r.snapshotId!==id))throw new Error('Archive metadata mismatch');
 console.log('Verified '+data.rows.length+' rows. '+(process.argv.includes('--apply')?'Restoring.':'Dry run only.'));
 if(process.argv.includes('--apply'))await prisma.$transaction(async tx=>{for(let i=0;i<data.rows.length;i+=1000)await tx.sponsor.createMany({data:data.rows.slice(i,i+1000),skipDuplicates:true});await tx.sponsorSnapshot.update({where:{id},data:{archivedAt:null}});},{timeout:180000});
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());
