const fs=require('node:fs');const path=require('node:path');
try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}
const origin=new URL(process.env.APP_URL||'http://localhost:3000');
if(origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password||(origin.protocol!=='https:'&&origin.origin!=='http://localhost:3000'))throw Error('APP_URL must be a canonical HTTPS origin, or localhost for development');
const output=path.resolve('work/extension-build');fs.mkdirSync(output,{recursive:true});fs.cpSync(path.resolve('../extension'),output,{recursive:true});
fs.writeFileSync(path.join(output,'src/config.js'),'globalThis.GREENLIST_APP_URL='+JSON.stringify(origin.origin)+';\n');
const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));manifest.host_permissions=manifest.host_permissions.filter(h=>!h.includes('localhost'));manifest.host_permissions.push(origin.origin+'/*');fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));
console.log('Extension prepared for '+origin.origin+' in '+output);
