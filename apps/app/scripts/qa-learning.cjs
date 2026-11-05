const {chromium}=require('@playwright/test'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000/demo?tab=learning');await page.getByRole('heading',{name:'Your shared learning plan'}).waitFor();
 await page.getByLabel('Hours per week').fill('2');await page.getByRole('checkbox').first().check();await page.getByRole('button',{name:'Save learning preferences'}).click();
 const correct=[1,2,0,1,2];for(let i=0;i<5;i++)await page.locator('fieldset').nth(i).getByRole('radio').nth(correct[i]).check();
 await page.getByLabel('Explain your reasoning for one answer').fill('The joined table repeats customer IDs once per order, so I would count distinct IDs and validate the grain.');
 await page.getByRole('button',{name:'Save and resume later'}).click();await page.reload();await page.getByRole('heading',{name:'Your shared learning plan'}).waitFor();assert.equal(await page.locator('input[type=radio]:checked').count(),5);
 await page.getByRole('button',{name:'Submit for exercise feedback'}).click();await page.getByRole('heading',{name:'Latest feedback · diagnostic'}).waitFor();
 assert.equal(await page.getByText('Evidence from one exercise',{exact:true}).count(),5);
 await page.getByLabel('Choose a role').selectOption('demo-1');await page.getByLabel('Your response',{exact:true}).fill('I would define the conversion metric, check duplicates and missing values, and explain uncertainty before recommending a change.');
 await page.getByRole('button',{name:'Save rehearsal'}).click();await page.getByText(/Interview rehearsal ·/).click();await page.getByRole('button',{name:'AI feedback requires a connected account'}).waitFor();
 await page.screenshot({path:'work/learning-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Learning mobile overflow');await page.screenshot({path:'work/learning-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Learning browser QA passed: saved preferences, saved/resumed diagnostic, grading, evidence, interview history, mobile layout, no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
