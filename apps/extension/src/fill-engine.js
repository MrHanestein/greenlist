/* Shared with fixture tests; conservative mapping never guesses custom questions. */
(function(root){
 const sensitive=/authori[sz]|sponsor|visa|citizen|nationality|ethnic|gender|disabil|veteran|race|consent|salary|right.to.work/i;
 function fieldText(el,doc){
  const labels=[...(el.labels||[])].map(l=>l.textContent).join(' ');
  return [labels,el.getAttribute('aria-label'),el.getAttribute('placeholder'),el.name,el.id].filter(Boolean).join(' ').toLowerCase().replace(/[_\-]/g,' ');
 }
 function identify(el,doc){
  const text=fieldText(el,doc);
  if(sensitive.test(text)||['checkbox','radio','file','hidden','password','submit','button','date'].includes(el.type)||el.tagName!=='INPUT')return null;
  if(/first\s*name|given\s*name/.test(text))return 'firstName';
  if(/last\s*name|family\s*name|surname/.test(text))return 'lastName';
  if(/full\s*name|^name\s*name$|^name$/.test(text.trim()))return 'fullName';
  if(/e\s*mail/.test(text)||el.type==='email')return 'email';
  if(/phone|mobile|telephone/.test(text))return 'phone';
  if(/linkedin/.test(text))return 'linkedin';
  if(/portfolio|personal website/.test(text))return 'portfolio';
  if(/current (?:company|employer)/.test(text))return 'currentCompany';
  if(/current (?:job )?title/.test(text))return 'currentTitle';
  if(/^(?:school|university|school university)(?: (?:school|university))*$/.test(text.trim()))return 'school';
  if(/^degree(?: degree)*$/.test(text.trim()))return 'degree';
  return null;
 }
 function fill(doc,profile,answers=[]){
  const filled=[],review=[];
  for(const el of doc.querySelectorAll('input,select,textarea')){
   if(el.closest('[data-greenlist]')||el.disabled||el.readOnly||el.value?.trim())continue;
   let visible=true;
   for(let parent=el;parent;parent=parent.parentElement){const style=doc.defaultView.getComputedStyle(parent);if(parent.hidden||parent.getAttribute('aria-hidden')==='true'||style.display==='none'||style.visibility==='hidden'){visible=false;break;}}
   if(!visible)continue;
   if(el.type==='hidden')continue;
   let key=identify(el,doc);
   const normal=s=>s.toLowerCase().replace(/\*|\(required\)/g,'').replace(/\s+/g,' ').trim();
   const label=normal([...(el.labels||[])].map(l=>l.textContent).join(' ')||el.getAttribute('aria-label')||'');
   const approved=answers.filter(a=>normal(a.question)===label);
   if(!key&&!sensitive.test(fieldText(el,doc))&&['TEXTAREA','INPUT'].includes(el.tagName)&&!['checkbox','radio','file','hidden','password','submit','button','date'].includes(el.type)&&approved.length===1)key='approvedAnswer';
   // Repeated education/employment controls require manual context selection.
   if(['school','degree','currentCompany','currentTitle'].includes(key)&&[...doc.querySelectorAll('input')].filter(n=>identify(n,doc)===key).length!==1){review.push(el);continue;}
   const value=key==='approvedAnswer'?approved[0].answer:key==='fullName'?[profile.firstName,profile.lastName].filter(Boolean).join(' '):profile[key];
   if(!key||!value){if(sensitive.test(fieldText(el,doc))||el.required)review.push(el);continue;}
   const proto=Object.getPrototypeOf(el),setter=Object.getOwnPropertyDescriptor(proto,'value')?.set;
   if(setter)setter.call(el,value);else el.value=value;
   el.dispatchEvent(new doc.defaultView.Event('input',{bubbles:true}));
   el.dispatchEvent(new doc.defaultView.Event('change',{bubbles:true}));
   filled.push(el);
  }
  return {filled,review};
 }
 root.GreenlistFill={fill,identify};
})(globalThis);
