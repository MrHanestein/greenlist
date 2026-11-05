# Data analyst pilot: research and release ledger

Updated 14 September 2026. This ledger separates observed evidence from work still outstanding.

## Employer research started

| Employer | Official source inspected | Finding | Identity / permission status |
|---|---|---|---|
| Monzo | https://monzo.com/careers | Careers page links to Greenhouse; observed board identifier `monzo` | Legal entity mapping still requires review; commercial permission not established |
| Monzo | https://monzo.com/blog/interviewing-for-data-science-at-monzo | Employer-published data science interview guide; published 27 April 2026. Useful context on analytical reasoning and communication, not proof of the process for every analyst vacancy | Link as contextual reading; do not claim exact questions or current applicability to another role |
| Wise | https://wise.jobs/wisestart-programs | Graduate and internship programmes exist; locations and open roles must be checked individually | Board identity and legal mapping pending; commercial permission not established |
| Wise | https://wise.jobs/job/graduate-data-analyst-compliance-in-singapore-jid-2545 | Search result identifies a Singapore graduate role; excluded from UK coverage | Not a UK vacancy or evidence of UK sponsorship |
| Starling | https://www.starlingbank.com/careers/ | Careers directory includes multiple UK and overseas locations | Role-level graduate/data eligibility unverified; commercial permission not established |
| Deliveroo | https://careers.deliveroo.co.uk/role/data-analyst-accounting-data-and-systems-e2989d5c1659/ | Analyst advert located; graduate suitability and sponsorship need explicit review | Do not classify as sponsorship offered or enable feed on this evidence alone |

The companion EMPLOYER-CANDIDATES.md / employer-candidates.json contains 100 register-derived candidates with explicit nulls for unknown careers connections. It is NOT the completed 100-employer review. Do not use register keywords as a proxy for good graduate job coverage.

## Coverage and evaluation

- No commercial feed permission has been obtained in this work.
- No live vacancies were enabled by this implementation.
- The full 100-real-vacancy evaluation is outstanding. Researching careers pages does not pass it.
- Zero unsupported sponsorship labels is an acceptance target, not an achieved measurement.
- Twenty real application forms and thirty real AI packs still need evaluation; automated synthetic tests are separate.
- Do not infer historical sponsorship volumes from the register.

For each evaluated vacancy record source URL, retrieval/check date, location, role level, legal identity confidence, licence route/rating, exact sponsorship evidence, manual policy label, automated label, closure status, duplicates and reviewer decision. Keep full descriptions out of public research files unless reuse rights allow them.

## Source rights enquiry — draft, not sent

Subject: Permission to display and analyse your public vacancies in Greenlist

We are preparing a small UK graduate job-search and application-preparation pilot. We would like to retrieve vacancies from your official feed, display attributed listings and source links, cache permitted content, and analyse the advert for skills and explicit sponsorship wording. We would not submit applications automatically or describe an employer licence as a vacancy sponsorship offer.

Please confirm which uses are permitted, whether sending advert text to our AI processing provider is covered, the permitted retention period, attribution requirements, refresh limits, closure/deletion requirements and any fees. Our job-data budget is at most £100 per month. We will not treat a publicly accessible endpoint as permission for these uses.

## Community setup

Owner creates Discord; no server has been created. Channels: announcements, data-practice, application-questions, interview-debriefs, voluntary-introductions. Rules: no fees for introductions; no job/sponsorship guarantees; no requests for passports, money or credentials; remove personal information from shared examples; respect confidentiality of interviews and tests; report privately to a named human moderator. Configure Discord AutoMod and human escalation. No automatic AI bans or referral marketplace.

## Release gates

Business-model review, content review, feed permissions, real-provider tests, complete privacy/support/terms, 100 vacancy reviews, 20 forms, 30 packs and backup restoration remain required. Checkout requires both PAID_PILOT_ENABLED=true and BUSINESS_MODEL_REVIEWED=true; never set the second flag merely because code exists. Portal access remains available independently for existing customers.
