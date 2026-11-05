importScripts('config.js');
chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
const allowedBase=new Set([globalThis.GREENLIST_APP_URL]);
function supported(url){try{const h=new URL(url).hostname;return ['greenhouse.io','greenhouse.com','lever.co'].some(s=>h===s||h.endsWith('.'+s));}catch{return false;}}
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
 (async()=>{
  const popup=!sender.tab && sender.url===chrome.runtime.getURL('src/popup.html');
  if(['SET_TOKEN','GET_AUTH_STATE','SIGN_OUT'].includes(message.type)&&!popup)throw new Error('Not permitted');
  if(message.type==='SET_TOKEN'){if(!allowedBase.has(message.baseUrl)||typeof message.token!=='string'||message.token.length>4000)throw new Error('Invalid connection');await chrome.storage.local.set({autofillToken:message.token,baseUrl:message.baseUrl});return {ok:true};}
  if(message.type==='SIGN_OUT'){await chrome.storage.local.remove('autofillToken');return {ok:true};}
  const {autofillToken,baseUrl=globalThis.GREENLIST_APP_URL}=await chrome.storage.local.get(['autofillToken','baseUrl']);
  if(message.type==='GET_AUTH_STATE')return {signedIn:!!autofillToken,baseUrl};
  if(!supported(sender.url)||!['GET_PROFILE','LOG_AUTOFILL'].includes(message.type))throw new Error('Unsupported page');
  if(!autofillToken)return {error:'Connect the extension from Account first'};
  if(!allowedBase.has(baseUrl))throw new Error('Invalid app address');
  if(message.type==='LOG_AUTOFILL'&&message.payload?.hostUrl!==sender.url)throw new Error('Page address mismatch');
  const res=await fetch(baseUrl+'/api/autofill/'+(message.type==='GET_PROFILE'?'profile?jobUrl='+encodeURIComponent(sender.url):'log'),{method:message.type==='GET_PROFILE'?'GET':'POST',headers:{Authorization:'Bearer '+autofillToken,'Content-Type':'application/json'},body:message.type==='LOG_AUTOFILL'?JSON.stringify(message.payload):undefined,signal:AbortSignal.timeout(15000)});
  return {status:res.status,data:await res.json()};
 })().then(sendResponse).catch(e=>sendResponse({error:e.message||'Connection failed'}));return true;
});