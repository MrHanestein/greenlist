import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'pglite-server';
async function main(){const db=new PGlite(process.env.LOCAL_DB_DIR ?? './work/local-postgres');await db.waitReady;const server=createServer(db);server.listen(54329,'127.0.0.1',()=>console.log('Local development PostgreSQL listening on 127.0.0.1:54329'));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close();db.close().finally(()=>process.exit(0));});}
main().catch(e=>{console.error(e);process.exit(1);});