// Original pilot content. Professional review remains a release gate.
export const curriculumVersion = 'analyst-1';
export const skills = [
 {id:'sql',name:'SQL and joins',pattern:/\b(sql|postgresql|joins?)\b/i,task:'Query related tables without changing the intended row grain.',url:'https://www.postgresql.org/docs/current/tutorial-sql.html'},
 {id:'cleaning',name:'Spreadsheets and data quality',pattern:/\b(excel|spreadsheet|cleaning|data quality)\b/i,task:'Check missing values, duplicates and consistent definitions before analysis.',url:'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/'},
 {id:'statistics',name:'Charts and statistics',pattern:/\b(statistics|statistical|chart|visualisation|visualization)\b/i,task:'Choose useful comparisons and explain uncertainty.',url:'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/'},
 {id:'metrics',name:'Business metrics',pattern:/\b(kpi|metrics?|conversion|dashboard|power bi|tableau)\b/i,task:'Define a business measure and a consistent denominator.',url:'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/'},
 {id:'communication',name:'Explaining findings',pattern:/\b(stakeholder|communicat\w*|present\w*|insights?)\b/i,task:'Explain the decision, evidence and limitations to a stakeholder.',url:'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/'}
] as const;
export type SkillId=typeof skills[number]['id'];
export type Mode='diagnostic'|'practice'|'reassessment';
type Question={id:string;skill:SkillId;prompt:string;options:string[];correct:number;explanation:string};
const bank:Record<Mode,Question[]>={
 diagnostic:[
 {id:'d-sql',skill:'sql',prompt:'Customers has one row per customer; Orders has several per customer. After an inner join, which expression counts customers who ordered?',options:['COUNT(*)','COUNT(DISTINCT customers.id)','SUM(orders.amount)'],correct:1,explanation:'The join repeats customer IDs for each order. Count distinct customer IDs for this measure.'},
 {id:'d-clean',skill:'cleaning',prompt:'A revenue column has blank cells. What should you do before replacing them with zero?',options:['Replace all blanks immediately','Delete all affected rows','Check whether blank means missing, not applicable or zero'],correct:2,explanation:'Blank and zero have different meanings. Establish the source definition and document the treatment.'},
 {id:'d-stat',skill:'statistics',prompt:'Mean salary is £60,000 and median salary is £35,000. Which conclusion is justified?',options:['A few high salaries may pull the mean upward; inspect the distribution','Most employees earn £60,000','The data must be wrong'],correct:0,explanation:'The difference is consistent with a right-skewed distribution, but inspect the data before concluding why.'},
 {id:'d-metric',skill:'metrics',prompt:'100 of 2,000 eligible visitors purchased. What is visitor conversion?',options:['20%','5%','0.05%'],correct:1,explanation:'100 divided by 2,000 is 0.05, or 5%. Keep eligibility and time period consistent.'},
 {id:'d-comms',skill:'communication',prompt:'Sales rose after a campaign, but there was no control group. Which summary is strongest?',options:['The campaign caused all the increase','The campaign had no effect','Sales rose during the campaign; seasonality or other changes could also explain it'],correct:2,explanation:'Describe the observed association and causal limitations, then suggest a stronger comparison.'}
 ],
 practice:[
 {id:'p-sql',skill:'sql',prompt:'You need every account, including accounts with no payments. Which starting join fits?',options:['Accounts LEFT JOIN Payments','Accounts INNER JOIN Payments','Payments INNER JOIN Accounts'],correct:0,explanation:'A left join preserves accounts without matching payments. Later WHERE filters must not accidentally remove them.'},
 {id:'p-clean',skill:'cleaning',prompt:'Two rows have the same customer name. What is the safest duplicate check?',options:['Delete the second row','Check stable IDs and the intended row grain','Treat all names as unique'],correct:1,explanation:'Names are not stable unique identifiers. Determine whether each row represents a person, event or transaction.'},
 {id:'p-stat',skill:'statistics',prompt:'You need to compare monthly revenue over two years. Which chart is a reasonable default?',options:['Pie chart with 24 slices','Unlabelled 3D chart','Line chart with clear month and revenue axes'],correct:2,explanation:'An ordered time axis makes trends visible. Label units and note gaps or definition changes.'},
 {id:'p-metric',skill:'metrics',prompt:'A conversion dashboard changed from sessions to unique people in its denominator. What next?',options:['Document the change and rebuild comparable history where possible','Claim the new rate proves improvement','Combine the two definitions without a note'],correct:0,explanation:'A definition change can produce an apparent performance change. Compare like with like.'},
 {id:'p-comms',skill:'communication',prompt:'A manager asks whether to stop a product. Which response helps most?',options:['Send every raw row','Explain the decision metric, findings, uncertainty and a next step','Only send a p-value'],correct:1,explanation:'A useful analysis connects evidence to the decision and makes limitations actionable.'}
 ],
 reassessment:[
 {id:'r-sql',skill:'sql',prompt:'Each invoice joins to several invoice lines. You need the number of invoices, not lines. What counts it?',options:['COUNT(lines.id)','SUM(lines.quantity)','COUNT(DISTINCT invoices.id)'],correct:2,explanation:'The joined table is at line grain; distinct invoice IDs recover the invoice count.'},
 {id:'r-clean',skill:'cleaning',prompt:'A score of -1 appears in a satisfaction survey. Before including it in the mean, what should you check?',options:['Whether -1 is a missing-response code','Whether deleting low scores improves the mean','Nothing: all numeric values are valid'],correct:0,explanation:'Numeric sentinel codes can represent missingness. Consult the source definition before calculating.'},
 {id:'r-stat',skill:'statistics',prompt:'Delivery times have a few very large delays. Which summary best describes a typical delivery while acknowledging those delays?',options:['Maximum only','Median plus a spread/tail measure and sample size','Mean only, without context'],correct:1,explanation:'A median describes the centre while spread and tail measures reveal delays that a single number hides.'},
 {id:'r-metric',skill:'metrics',prompt:'60 of 1,500 eligible trial accounts became paid accounts in the same cohort window. What is conversion?',options:['40%','0.4%','4%'],correct:2,explanation:'60 / 1,500 = 0.04 = 4%. Define the cohort and observation window.'},
 {id:'r-comms',skill:'communication',prompt:'A new onboarding flow has a higher conversion rate, but users were not randomly assigned. What should you report?',options:['The observed difference, possible selection effects and a plan for a fair comparison','The flow definitely caused the increase','There is no useful information'],correct:0,explanation:'Separate observed differences from causal conclusions and explain how the comparison could be improved.'}
 ]
};
export function questions(mode:Mode){return bank[mode].map(({correct,explanation,...q})=>q);}
export type Result={skill:SkillId;correct:boolean;explanation:string};
export type Attempt={id:string;mode:Mode;version:string;createdAt:string;results:Result[];reflection:string};
export type LearningState={hours:number;selectedJobIds:string[];draft:{mode:Mode;answers:Record<string,number>;reflection:string}|null;attempts:Attempt[];completedResources:string[];interviews:{id:string;jobId:string;question:string;answer:string;createdAt:string;feedback?:{points:{area:string;quote:string;comment:string}[];uncertainties:string[];nextTask:string;nextQuestion:string;model:string;createdAt:string}}[]};
export const emptyLearning=():LearningState=>({hours:3,selectedJobIds:[],draft:null,attempts:[],completedResources:[],interviews:[]});
export function grade(mode:Mode,answers:Record<string,number>):Result[]{
 if(Object.keys(answers).length!==bank[mode].length||bank[mode].some(q=>!Number.isInteger(answers[q.id])||answers[q.id]<0||answers[q.id]>=q.options.length))throw new Error('Answer every question using the available choices.');
 return bank[mode].map(q=>({skill:q.skill,correct:answers[q.id]===q.correct,explanation:q.explanation}));
}
export function evidence(state:LearningState){
 const latest=state.attempts.filter(a=>a.mode!=='practice'&&a.version===curriculumVersion).at(-1);
 return skills.map(s=>({...s,status:!latest?'Unassessed':latest.results.find(r=>r.skill===s.id)?.correct?'Evidence from one exercise':'Practise next'}));
}
export function learningPlan(state:LearningState,descriptions:string[]){
 return evidence(state).filter(s=>s.status!=='Evidence from one exercise').sort((a,b)=>Number(descriptions.some(d=>b.pattern.test(d)))-Number(descriptions.some(d=>a.pattern.test(d)))).map((s,i)=>({...s,minutes:30,week:Math.floor(i/Math.max(1,Math.floor(state.hours*2)))+1}));
}
export function roleBrief(job:{description:string;url:string;lastCheckedAt:Date|string}){
 const text=job.description.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const mentioned=skills.filter(s=>s.pattern.test(text));
 return {version:curriculumVersion,source:job.url,checkedAt:job.lastCheckedAt,requirements:mentioned.map(s=>({skill:s.id,name:s.name,quote:text.split(/(?<=[.!?])\s+/).find(line=>s.pattern.test(line))?.slice(0,600)||'',task:s.task})),questions:['Which tools and tasks are used most in the first three months?','What stages and practical exercises are in the interview?','Does this particular vacancy support my current and future sponsorship needs?'],history:'History unavailable'};
}
export function priority(job:{vacancyPolicy:string;licenceStatus:string;description:string},user:{needsSponsorshipNow:boolean|null;needsSponsorshipFuture:boolean|null},state:LearningState){
 if((user.needsSponsorshipNow||user.needsSponsorshipFuture)&&job.vacancyPolicy==='NOT_OFFERED')return {label:'Deprioritise',reason:'The advert refuses sponsorship. Confirm any distinction between current and future needs with the employer.'};
 if(user.needsSponsorshipFuture&&!user.needsSponsorshipNow)return {label:'Check with employer',reason:'A current sponsorship offer is not a commitment to sponsor you later. Confirm your future requirements directly.'};
 if((user.needsSponsorshipNow||user.needsSponsorshipFuture)&&(job.vacancyPolicy!=='OFFERED'||job.licenceStatus!=='LICENSED'))return {label:'Check with employer',reason:'Sponsorship compatibility is not established for your requirements.'};
 const needed=evidence(state).filter(s=>s.pattern.test(job.description));
 if(!needed.length||needed.some(s=>s.status==='Unassessed'))return {label:'Check with employer',reason:'Readiness is unassessed or the advert does not identify enough supported skills.'};
 if(needed.some(s=>s.status==='Practise next'))return {label:'Prepare further',reason:'Your latest assessment identifies a gap in a skill mentioned in this advert.'};
 return {label:'Prioritise',reason:'You demonstrated the sampled skills mentioned here. Check experience requirements, deadlines and remaining unknowns; this is not a hiring probability.'};
}
