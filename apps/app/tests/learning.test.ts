import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyLearning,grade,evidence,learningPlan,priority,roleBrief,questions,curriculumVersion} from '../src/lib/learning';
import {validateInterviewFeedback} from '../src/lib/interview';
const answers={'d-sql':1,'d-clean':2,'d-stat':0,'d-metric':1,'d-comms':2};
test('assessment rejects partial, unknown and out-of-range answers',()=>{
 assert.throws(()=>grade('diagnostic',{}));assert.throws(()=>grade('diagnostic',{...answers,'d-sql':3}));assert.throws(()=>grade('diagnostic',{...answers,extra:0}));assert.equal(grade('diagnostic',answers).filter(r=>r.correct).length,5);
 assert.ok(questions('diagnostic').every(q=>!('correct' in q)&&!('explanation' in q)));
});
test('lessons and practice cannot increase assessed evidence',()=>{
 const s=emptyLearning();s.completedResources=['sql'];s.attempts=[{id:'1',mode:'practice',version:curriculumVersion,createdAt:new Date().toISOString(),results:grade('diagnostic',answers),reflection:'example'}];assert.ok(evidence(s).every(x=>x.status==='Unassessed'));
 s.attempts.push({...s.attempts[0],id:'2',mode:'diagnostic'});assert.ok(evidence(s).every(x=>x.status==='Evidence from one exercise'));
});
test('sponsorship refusal and unknown licence override sampled skill success',()=>{
 const s=emptyLearning();s.attempts=[{id:'1',mode:'diagnostic',version:curriculumVersion,createdAt:new Date().toISOString(),results:grade('diagnostic',answers),reflection:'example'}];const user={needsSponsorshipNow:true,needsSponsorshipFuture:true};const job={description:'SQL and Excel',vacancyPolicy:'NOT_OFFERED',licenceStatus:'LICENSED'};
 assert.equal(priority(job,user,s).label,'Deprioritise');assert.equal(priority({...job,vacancyPolicy:'OFFERED',licenceStatus:'UNVERIFIED'},user,s).label,'Check with employer');assert.equal(priority({...job,vacancyPolicy:'OFFERED'},user,s).label,'Prioritise');
});
test('role brief distinguishes excerpts from inferred tasks and unavailable history',()=>{
 const b=roleBrief({description:'We use SQL. Explain insights to stakeholders.',url:'https://example.com/job',lastCheckedAt:'2026-09-14'});assert.equal(b.requirements[0].quote,'We use SQL.');assert.equal(b.history,'History unavailable');assert.ok(b.requirements[0].task);
});
test('shared plan prioritises relevant skills within the weekly time budget',()=>{
 const s=emptyLearning();s.hours=1;const p=learningPlan(s,['Communicate findings to stakeholders']);assert.equal(p[0].id,'communication');assert.equal(p[2].week,2);
});
test('AI feedback must quote the actual response and use the constrained rubric',()=>{
 const valid={points:[{area:'reasoning',quote:'denominator',comment:'Define the cohort.'}],uncertainties:[],nextTask:'Define the metric.',nextQuestion:'Which cohort?'};
 assert.ok(validateInterviewFeedback(valid,'I would check the denominator.'));
 assert.throws(()=>validateInterviewFeedback(valid,'I would count rows.'));
 assert.throws(()=>validateInterviewFeedback({...valid,points:[{...valid.points[0],area:'visa-eligibility'}]},'denominator'));
});
