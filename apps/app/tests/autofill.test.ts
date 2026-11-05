import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
const engine=readFileSync('../extension/src/fill-engine.js','utf8');
const profile={firstName:'Ada',lastName:'Lovelace',email:'ada@example.com',phone:'+44 7700 900123',linkedin:'https://linkedin.com/in/example',portfolio:'https://example.com'};
const layouts=[
 '<input id="first_name"><input id="last_name"><input id="email" type="email">',
 '<label for="a">First name</label><input id="a"><label for="b">Last name</label><input id="b">',
 '<input name="name" placeholder="Full name"><input name="email" type="email">',
 '<input aria-label="Given name"><input aria-label="Surname"><input aria-label="Phone number">',
 '<label>Full name<input name="name"></label><label>Email<input type="email"></label>',
 '<input placeholder="First Name"><input placeholder="Last Name"><input placeholder="Mobile">',
 '<input name="first-name"><input name="last-name"><input name="phone">',
 '<input aria-label="LinkedIn"><input aria-label="Portfolio">',
 '<fieldset><legend>Contact</legend><input id="first_name"><input id="last_name"></fieldset>',
 '<input id="email" type="email"><input id="phone"><input id="linkedin">'
];
for(const ats of ['greenhouse','lever'])for(const [i,layout] of layouts.entries())test(ats+' contact fixture '+(i+1),()=>{
 const dom=new JSDOM('<form>'+layout+'<label>Will you need visa sponsorship?<input required id="sponsor"></label><label>Are you authorised to work now?<select required id="auth"><option value="">Choose</option><option>Yes</option></select></label><input id="untouched" value="My existing answer"><input type="file" id="resume"><textarea aria-label="Why us?" required></textarea><button type="submit">Submit</button></form>',{runScripts:'outside-only',url:'https://'+(ats==='lever'?'jobs.lever.co':'boards.greenhouse.io')+'/example'});
 dom.window.eval(engine);let submissions=0;dom.window.document.querySelector('form')!.addEventListener('submit',()=>submissions++);
 const result=(dom.window as any).GreenlistFill.fill(dom.window.document,profile);
 assert.equal(result.filled.length,(layout.match(/<input/g)||[]).length);assert.ok(result.filled.every((el:HTMLInputElement)=>Object.values(profile).includes(el.value)||el.value==='Ada Lovelace'));
 assert.equal((dom.window.document.querySelector('#sponsor') as HTMLInputElement).value,'');
 assert.equal((dom.window.document.querySelector('#auth') as HTMLSelectElement).value,'');
 assert.equal((dom.window.document.querySelector('#untouched') as HTMLInputElement).value,'My existing answer');
 assert.equal((dom.window.document.querySelector('#resume') as HTMLInputElement).value,'');
 assert.equal(submissions,0);
 const again=(dom.window as any).GreenlistFill.fill(dom.window.document,profile);assert.equal(again.filled.length,0);
 dom.window.close();
});
test('unsupported custom controls and sensitive fields are never guessed',()=>{
 const dom=new JSDOM('<input name="nationality"><input name="salary"><input name="emailConsent" type="checkbox"><input name="email" disabled><input name="first_name" readonly><textarea required></textarea>',{runScripts:'outside-only'});
 dom.window.eval(engine);assert.equal((dom.window as any).GreenlistFill.fill(dom.window.document,profile).filled.length,0);dom.window.close();
});
test('hidden contact fields and honeypots stay empty',()=>{
 const dom=new JSDOM('<input id="first_name" style="display:none"><div hidden><input type="email"></div><div style="visibility:hidden"><input name="phone"></div><input id="last_name">',{runScripts:'outside-only'});
 dom.window.eval(engine);const result=(dom.window as any).GreenlistFill.fill(dom.window.document,profile);
 assert.equal(result.filled.length,1);assert.equal(result.filled[0].value,'Lovelace');
 assert.equal((dom.window.document.querySelector('#first_name') as HTMLInputElement).value,'');dom.window.close();
});

test('reviewed answers match exact labels and never fill sponsorship answers',()=>{
 const dom=new JSDOM('<label>Describe a project<textarea></textarea></label><label>Will you need sponsorship?<textarea required></textarea></label><label>Current employer<input></label><label>School<input></label><label>School<input></label>',{runScripts:'outside-only'});
 dom.window.eval(engine);const result=(dom.window as any).GreenlistFill.fill(dom.window.document,{...profile,currentCompany:'Example Ltd',school:'Example University'},[{question:'Describe a project',answer:'My approved project'},{question:'Will you need sponsorship?',answer:'No'}]);
 assert.equal(result.filled.length,2);assert.equal((dom.window.document.querySelector('textarea') as HTMLTextAreaElement).value,'My approved project');assert.equal((dom.window.document.querySelectorAll('textarea')[1] as HTMLTextAreaElement).value,'');assert.equal((dom.window.document.querySelectorAll('input')[1] as HTMLInputElement).value,'');dom.window.close();
});
