(()=>{
 if(document.querySelector('[data-greenlist]'))return;
 const host=location.hostname;
 const atsName=host==='lever.co'||host.endsWith('.lever.co')?'lever':'greenhouse';
 const container=document.createElement('div');container.dataset.greenlist='true';
 const shadow=container.attachShadow({mode:'closed'});
 const style=document.createElement('style');style.textContent=':host{all:initial}section{position:fixed;right:18px;bottom:18px;width:290px;padding:18px;background:#fff;color:#163d30;border:1px solid #b9c9bb;border-radius:16px;box-shadow:0 12px 45px #132e2428;font:14px/1.5 system-ui;z-index:2147483647}button{background:#176b43;color:white;border:0;padding:10px 16px;border-radius:8px;cursor:pointer}p{margin:10px 0}label{display:block;margin:8px 0}small{color:#52665b}';
 const panel=document.createElement('section');
 const title=document.createElement('strong');title.textContent='Greenlist · Review before you apply';
 const message=document.createElement('p');message.textContent='Fill contact details from your approved profile. Existing answers stay as they are.';
 const button=document.createElement('button');button.textContent='Fill my details';
 const checklist=document.createElement('div');
 const eventKey=crypto.randomUUID();
 button.addEventListener('click',async()=>{
  button.disabled=true;
  try{
   const response=await chrome.runtime.sendMessage({type:'GET_PROFILE'});
   if(response.error||response.status!==200)throw new Error(response.data?.error||response.error||'Reconnect your extension');
   const {filled,review}=GreenlistFill.fill(document,response.data.contact,response.data.answers||[]);
   message.textContent=filled.length+' supported fields filled. '+review.length+' required or sensitive fields need your review.';
   checklist.replaceChildren();
   for(const text of response.data.review){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';label.append(check,document.createTextNode(' '+text));checklist.append(label);}
   const note=document.createElement('small');note.textContent='Nothing has been submitted. Use the employer’s Submit button when ready, then confirm submission in your Greenlist tracker.';checklist.append(note);
   if(filled.length){const log=await chrome.runtime.sendMessage({type:'LOG_AUTOFILL',payload:{eventKey,atsName,hostUrl:location.href,title:document.title.slice(0,200),fieldsFilled:filled.length,fieldsLowConfidence:review.length}});if(log.status!==200)message.textContent+=' Your draft could not be synced; save it manually in Greenlist.';}
  }catch(e){message.textContent=e.message||'Could not fill this form. Try again.';}finally{button.disabled=false;}
 });
 panel.append(title,message,button,checklist);shadow.append(style,panel);document.body.append(container);
})();