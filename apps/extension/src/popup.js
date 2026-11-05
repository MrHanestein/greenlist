document.getElementById('accountLink').href=globalThis.GREENLIST_APP_URL+'/dashboard?tab=account';
document.getElementById('baseUrl').replaceChildren(new Option('Greenlist',globalThis.GREENLIST_APP_URL));
const statusEl=document.getElementById('status');
async function refresh(){const s=await chrome.runtime.sendMessage({type:'GET_AUTH_STATE'});statusEl.textContent=s.signedIn?'Connected. Tokens expire after seven days.':'Not connected';}
document.getElementById('saveToken').addEventListener('click',async()=>{const token=document.getElementById('tokenInput').value.trim();if(!token)return;const r=await chrome.runtime.sendMessage({type:'SET_TOKEN',token,baseUrl:document.getElementById('baseUrl').value});if(r.error){statusEl.textContent=r.error;return;}document.getElementById('tokenInput').value='';refresh();});
document.getElementById('signOut').addEventListener('click',async()=>{await chrome.runtime.sendMessage({type:'SIGN_OUT'});refresh();});refresh();