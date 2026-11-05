# Analyst diagnostic and learning rubric

Content version: analyst-1. Status: original pilot exercises, awaiting experienced analyst review. No certificate, hiring probability or guaranteed interview readiness.

## Skill map and sources

| Skill | Evidence sampled | Next learning step | Source |
|---|---|---|---|
| SQL | Distinct entity counts after one-to-many joins; preserving unmatched rows | Explain row grain and join choice on a second dataset | https://www.postgresql.org/docs/current/tutorial-sql.html |
| Data quality | Missing-value semantics and duplicate identity | Write a documented cleaning policy before changing data | https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/ |
| Charts/statistics | Skew, robust summaries and chart choice | Explain centre, spread, units and uncertainty | https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/ |
| Business metrics | Numerator, denominator, cohort and definition stability | Calculate and clearly define a conversion measure | https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/ |
| Communication | Association versus causality and practical recommendations | Explain a decision with limitations and a next check | https://monzo.com/blog/interviewing-for-data-science-at-monzo |

External sources are linked for context; exercises are original. Monzo's data science process is not a universal analyst hiring standard.

## Review instructions

Inspect all 15 questions (five each in diagnostic, practice and reassessment) in the app. For each, record whether the keyed answer is correct, distractors are unambiguous, assumptions are explicit, explanation is useful and difficulty is appropriate. Reject any question whose answer depends on an unstated convention. Record reviewer name, date, curriculum version and requested changes. No professional review has yet been recorded.

The initial short exercise set is a reasoning screen, not a practical SQL/coding assessment. Allocate 20–30 minutes including written reasoning; test this duration with real participants instead of treating it as measured. Reassessment uses different questions but repeat attempts can be memorised. Display the attempt history and avoid interpreting retakes as independent proof of general competence.

## Written response rubric for human review

Score each dimension 0 (absent/incorrect), 1 (partly justified), or 2 (clear and defensible): problem/metric definition; data-quality checks; appropriate method; validation; uncertainty; communication/action. Cite the user's exact passage supporting feedback. Do not convert the total into a hiring probability. Written reflection is stored but not automatically marked in the current implementation.

Example adequate SQL explanation: identify the original entity grain, explain how the join multiplies rows, and justify distinct entity counting for the stated measure. Example partial response: selects distinct but cannot explain why. Incorrect: treats joined row count as unique entity count.

## Practical project for reviewer-led pilot

Use an original small fictitious dataset with customers, orders and refunds. Ask the participant to define net revenue, identify data-quality issues, count purchasing customers, compare two time windows and write a five-sentence recommendation. Include customers without orders and multiple orders per customer. Do not execute submitted SQL on the application database. A practical execution sandbox is deferred; current questions do not execute code.

## Pilot measurements

Track first diagnostic completion, saved/resumed drafts, practice, reassessment, human-rated explanation quality, application preparation and confirmed submissions. Separate lesson opens from assessed progress. Compare the first diagnostic and first reassessment by skill; report small sample sizes and memorisation limits. Ask users whether a task changed their approach to a real application.
