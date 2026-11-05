// Independent tasks continue when another source fails; a failed run still exits nonzero.
const base=process.env.APP_URL,secret=process.env.CRON_SECRET;
if(!base||!secret||secret.length<32)throw new Error('APP_URL and CRON_SECRET are required');
(async()=>{
 const routes=process.argv.includes('--daily')?['sponsors/refresh','jobs/ingest','notifications/refresh','sponsors/archive']:['jobs/ingest','notifications/refresh'];
 const failures=[];
 for(const route of routes){
  let cursor=null;const visited=new Set();
  try{do{
   const url=new URL('/api/'+route,base);if(cursor)url.searchParams.set('cursor',cursor);
   const response=await fetch(url,{method:'POST',headers:{'x-cron-secret':secret},signal:AbortSignal.timeout(300000)});
   if(!response.ok)throw new Error(route+' failed with '+response.status);
   const data=await response.json();if(data.failures?.length)failures.push(route+' reported a source failure');
   cursor=data.nextCursor??null;if(cursor&&visited.has(cursor))throw new Error('Repeated source cursor');if(cursor)visited.add(cursor);
  }while(cursor);console.log(route+' completed');}catch(e){failures.push(e.message);}
 }
 if(failures.length)throw new Error(failures.join('; '));
})().catch(e=>{console.error(e.message);process.exitCode=1;});

