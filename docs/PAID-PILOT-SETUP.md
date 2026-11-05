Latest update: see [Data analyst implementation](DATA-ANALYST-IMPLEMENTATION.md) for 14 September changes. Matching is now free for both tiers; paid checkout additionally requires business-model review. The older pricing and notification descriptions below are superseded.

# Greenlist: paid-pilot implementation and setup

Updated 13 September 2026. This is an implemented local product, not a deployed or validated paid service. No provider accounts have been created, no domain has been purchased, and no commercial job-feed permission has been represented as granted.

## Implemented

- Separate employer licence and vacancy policy, including conditional sponsorship. Evidence extraction is versioned so rules can be refreshed on unchanged adverts.
- UK/location and seniority filtering, word-boundary skill matching, separate penalties for sponsorship needed now versus later, and paginated candidate scanning beyond the previous 1,000-job ceiling. Filters remain heuristics and need real-vacancy evaluation.
- Greenhouse and Lever ingestion; one-source batches with continuation cursors; failed sources retain listings. Confirmed complete-feed removals close listings. Exact canonical job links are deduplicated; different requisitions with identical wording remain separate. Aggregator redirects can still produce duplicates requiring review.
- Administrator-only employer review at /admin: legal name/town must match the dated register, aliases cannot silently move between employers, and enabled database feeds require a commercial-permission evidence URL. The admin screen offers 100 keyword-selected register candidates to research. These are NOT 100 reviewed employers.
- Configurable Anthropic preparation for pasted application questions, evidence references, CV before/after suggestions, missing-information prompts and saved, user-reviewed revisions. No provider call is made without configured credentials, model and cost rates. Unknown evidence IDs, unsupported numbers and nonexistent CV quotations are rejected. These checks do not prove semantic accuracy; every draft requires human review and the 30-pack real-world evaluation remains outstanding.
- Atomic pack reservations, successful-call cost accounting, a maximum configured £50 monthly AI budget, failed-call pack refunds and recovery of expired calls. Failed or uncertain provider calls retain a conservative cost reservation because they may have incurred a charge. Free trials remain lifetime; Plus allowance follows the subscription billing period.
- CV excerpt import from pasted/plain-text CVs, explicit fact approval, memory editing and up to ten private CV files of 2 MB each. PDF/DOCX files are stored and downloaded, not automatically parsed. Private file access checks account ownership; file deletion is part of account deletion.
- Autofill for contact details, unambiguous education/current employment inputs and exact-label answers from the latest user-reviewed pack for that job. Repeated entries, sensitive questions, uncertain fields and files stay manual. Never auto-submits.
- Job feedback, evidence reports, reply stage, searching/found-job status, separate deadline/follow-up reminders, delivery-failure records and pilot activity/cohort metrics. Finding a job stops search updates but does not automatically cancel billing.
- Billing portal access independent of sale-price availability; current subscription state remains authoritative. Checkout is closed by default. Operator/support information and AI configuration are required before opening it.
- Domain-configured extension packaging; no assumed ownership of app.greenlist.jobs. A product-policy page exists at /policies, but the operator's complete legal/privacy notice still requires completion before charging.
- Register archives: one snapshot older than 30 days per daily run, compressed into private storage, downloaded and checksum-verified before its database rows are removed. Latest successful snapshot remains in the database. Archive preserves parsed source rows, names, routes and ratings; it is not the original CSV byte stream. A dry-run/explicit-apply restore script is included.

## Create services in this order

1. Choose and purchase the domain in your own account after availability, renewal-price and brand checks. No candidate domain is currently confirmed available. Use one canonical origin for marketing and /dashboard.
2. Create Vercel and Neon accounts. Use commercial hosting, a managed PostgreSQL database and a private Blob store. Keep production data separate from local testing and preview environments.
3. Create Clerk production sign-in. Add the final domain and redirect URLs. Add your Clerk user ID to ADMIN_CLERK_IDS; ordinary customers cannot access operations.
4. Create an Anthropic account. Configure a currently available model and verified GBP-equivalent input/output token prices. Add a provider-side budget as well as the app budget. Test factual preparation before enabling payment.
5. Create Stripe, complete its account requirements, then configure a £15 GBP monthly price, verified webhooks and a customer portal allowing cancellation at period end. Start with test mode. Confirm taxes, refunds, support and published merchant details for the business.
6. Create Resend, verify the sending domain and configure a real support inbox. Set up SPF/DKIM/DMARC using the providers' instructions. Keep job emails opt-in.
7. Review employer websites and job-feed permissions. Configure approved boards through /admin. Use Adzuna only once the intended display, storage and AI processing are covered and attribution is configured. The official logo URL is required by the importer.
8. Set up the scheduler and monitor failed runs. The daily run refreshes the register, jobs and notifications, then archives one old snapshot. Failure in one subsystem does not prevent attempting the others.

Keep credentials in the hosting environment or the untracked local .env file, not chat, source control or downloaded reports. Planning ceilings remain £100 data, £50 AI, £60 hosting/database/storage, £30 accounts/email/monitoring and £60 contingency per month. Domain and transaction fees are additional.

## Operator commands

Run from apps/app:

```text
npm run db:deploy
npm run launch:check
npm run extension:build
node scripts/run.cjs scripts/restore-register.ts SNAPSHOT_ID
```

The restore command checks the archive only unless --apply is supplied. Rebuild and package work/extension-build after changing APP_URL. The current ZIP targets localhost and must not be distributed as the production extension.

For Vercel, use the existing workspace app, build it with its package script and apply migrations as a separate release step. Do not run the retired historical migration generator. The development PGlite database is not production hosting.

## Required before accepting pilot payments

- Complete identity/careers-page review of 100 relevant employers; obtain and record feed rights. The candidate list is a research starting point only.
- Review 100 real vacancies with zero unsupported “sponsorship offered” labels. Include ambiguous names, refusals, conditions, missing salaries, duplicates, stale roles and failed refreshes.
- Evaluate 30 real AI packs for unsupported personal claims, usefulness and saved edits. Unit tests use mocked generation and do not establish provider quality.
- Test 20 representative real Greenhouse/Lever forms. Synthetic layout tests do not establish 95% accuracy on real sites.
- Test successful purchases, authentication challenges, declines, renewals, failed payments, duplicate/out-of-order webhooks, cancellation and retained free access against Stripe test services.
- Test actual private Blob upload/download/deletion, account deletion with the real identity service, and managed-database backup restoration.
- Complete the operator's privacy notice, retention policy, service-provider disclosures, subscription/refund terms and support information. /policies currently contains product behaviour and setup disclosures, not a completed operator-specific legal notice.
- Only then set PAID_PILOT_ENABLED=true and invite 20 participants. No invitations have been sent. Run the four-week pilot: target five paying users and at least half of eligible, still-searching paying users taking meaningful action in week four.

The app cannot guarantee retention. Measure useful preparation/submissions and customer feedback; treat finding a job as successful completion.
