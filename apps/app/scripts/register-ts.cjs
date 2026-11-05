const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
const resolve=Module._resolveFilename;
Module._resolveFilename=function(name,parent,...rest){return resolve.call(this,name.startsWith('@/')?path.resolve('src',name.slice(2)):name,parent,...rest);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,file)=>{const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});mod._compile(output.outputText,file);};
