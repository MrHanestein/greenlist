# Greenlist paid-pilot playbook

## Release gates before charging

- Review 100 actual tech/data adverts against their source text. Record URL, check date, legal-name evidence, vacancy label, quote, qualification/contradiction, correction and reviewer. Require zero unsupported OFFERED labels.
- Test 20 actual Greenhouse/Lever flows with the applicant's permission. Stop before submission unless they choose to submit. Record ordinary fields attempted/correct, existing values preserved, sensitive fields untouched and required fields remaining. Target at least 95% ordinary-field accuracy.
- Verify Clerk sign-up/sign-in, separate-user isolation and account removal.
- In Stripe test mode, check successful and declined checkout, repeated checkout clicks, signed webhooks, period-end cancellation, expired access, portal return and deletion with an active subscription.
- Verify source quotas, failure reporting, retained register snapshots and visible freshness.
- Check that email updates can be disabled and unchanged matches do not generate repetitive alerts.

No recruitment messages or outreach have been sent as part of implementation.

## Ten discovery interviews

Recruit international UK students/recent graduates seeking tech/data roles, including people needing sponsorship now and later. Ask about real behaviour before showing the app:

1. Walk me through the last role you applied for.
2. How did you check sponsorship?
3. What information was missing or contradictory?
4. What did you repeat from the previous application?
5. What tools did you use and what did they fail to solve?
6. What have you already paid for?
7. Where do you keep submitted CVs and answers?
8. What makes you stop using a tool after one week?
9. After trying Greenlist on a real role, what was useful or confusing?
10. Would you pay GBP 15 for the next month? Test an actual purchase only after the release gates pass.

Capture observations with consent. Do not collect unnecessary immigration documents or application credentials.

## Recruitment message to adapt

I'm testing Greenlist, a UK tech/data job-search app for international graduates. It separates employer sponsor-register evidence from what a job advert actually says, helps you reuse approved experience examples, and tracks applications. I'm looking for people willing to try it on their current search and give direct feedback. The first session is a product test; there is no job or sponsorship guarantee.

Choose intended communities and check posting rules before sending. Do not imply university endorsement.

## Four-week cohort

- Recruit 20 activated users. Activation means a completed profile and at least one preparation pack for a real shortlisted role.
- Offer the same GBP 15 monthly plan and cancellation terms to everyone.
- Target five paying users and meaningful week-four activity from at least half of still-searching paying users.
- Meaningful activity is preparation, approved-example editing, autofill or application updates. Billing webhooks and logins alone do not count.
- Separate successful job-finding from dissatisfied churn. Ask the user; an OFFER status does not prove acceptance or the end of a search.
- Review support time, source/API costs, infrastructure, fees and refunds before assessing profitability.

Weeks 1–2: observe onboarding, shortlist trust and form errors. Weeks 3–4: measure repeat use, outcomes and actual renewals. If users do not return, investigate coverage and trust before adding features.

## Cohort record

Maintain a consented internal record of anonymous participant ID, activation date, free/paid status, first useful match, packs, confirmed applications, reported replies/interviews, week-four activity, still-searching status, cancellation reason and support minutes.

## Cost boundary

Keep the initial non-labour budget near GBP 300 monthly. Use capped source pulls and deterministic preparation. Check invoices weekly. Defer paid acquisition until people pay and return.

100 subscribers at GBP 15/month means GBP 1,500 gross recurring revenue before fees, taxes, refunds, operations and founder labour. It is not a profit forecast.
