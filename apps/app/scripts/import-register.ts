import { readFile } from 'node:fs/promises';
import { importRegister } from '../src/lib/register';
import { prisma } from '../src/lib/prisma';
async function main(){const [file,date]=process.argv.slice(2);if(!file||!/^\d{4}-\d{2}-\d{2}$/.test(date ?? ''))throw new Error('Usage: import-register <csv-path> YYYY-MM-DD');const s=await importRegister(await readFile(file,'utf8'),new Date(date+'T00:00:00Z'),'https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers');console.log({snapshotId:s.id,rows:s.rowCount,date:s.sourceDate});}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>prisma.$disconnect());