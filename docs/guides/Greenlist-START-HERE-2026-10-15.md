# Greenlist — follow these steps in order

Updated 15 October 2026. Use this as the main checklist; earlier reports are background. Checked against the existing project and the supplied Student Pack list. No accounts were created, offers redeemed, code changed or extension published while preparing this document.

## What exists, and what does not

The project is C:/Users/eveli/greenlist. The web app is apps/app; the Chrome extension is apps/extension. The original downloaded index_1.html is not the current application.

Implemented locally: shortlist/evidence, application memory and packs, tracking, learning exercises and history, role explanations, priority guidance, interview rehearsal and optional AI feedback. A Manifest V3 extension fills supported fields on Greenhouse and Lever. The demo uses samples. Actual account/provider setup and live job coverage are still outstanding according to the last recorded checks. The last recorded 68-test result used mocked AI calls; no new full test run was performed for this document.

## Step 1 — Select only the offers that serve this project

Redeem from your signed-in [GitHub Student Developer Pack](https://education.github.com/pack), checking eligibility, allowed use, usage limits, expiry and renewal before activating.

| Priority | Offer | Use in Greenlist |
|---|---|---|
| Now | GitHub Pro + GitHub Desktop | Private code history and an approachable way to review/revert edits; Desktop is free for everyone |
| Now | VS Code + Copilot Student | Manual editing with optional AI assistance; student AI usage is limited |
| Now | 1Password | Account credentials and recovery codes; listed offer is two years |
| At account setup | Clerk | Listed student offer is Pro while eligible; matches existing sign-in integration |
| At billing setup | Stripe | Listed $25 fee credit; does not replace verification or payment testing |
| When choosing the name | Name.com OR Namecheap OR .TECH | Choose one suitable domain, verify renewal cost; do not claim every offer just because it is free |
| Before pilot | Sentry | Error reporting; configure personal-data filtering and keep sensitive-page replay disabled |
| During design checks | Polypane | Optional responsive/accessibility checks; listed individual-plan offer is one year |
| For your own learning | Frontend Masters or Scrimba | Learn enough HTML/React to edit confidently; activate timed trials when ready to use them |

Optional later: Testmail for email tests, Requestly for debugging, a single analytics service if the internal events are insufficient. Testmail is not the production sender or support inbox. Student course access does not grant rights to reproduce courses or resell access inside Greenlist.

Skip for this launch: switching to Heroku/Azure/Appwrite solely for credits; multiple monitoring products; WordPress themes/Bootstrap Studio as a replacement for the existing Next.js app; LocalStack when AWS is not used; scraping tools as a substitute for data-use permission. GitHub Pages does not host this app's database-backed server routes. Vercel provisions SSL for correctly configured domains, so no separate paid SSL certificate is needed for this setup: https://vercel.com/docs/domains/working-with-ssl

JetBrains educational licences are restricted to non-commercial use; do not select that student licence for this commercial project. See https://www.jetbrains.com/academy/student-pack/

Cursor can open this same project, but it is optional. Use https://cursor.com/pricing and https://cursor.com/students to check its current offer; do not assume the GitHub Pack includes Cursor Pro.

Done when: you have one editor, your GitHub account and a place to store credentials. Other offers can wait until their step.

## Step 2 — Protect the project before editing

Install [GitHub Desktop](https://desktop.github.com/) and [VS Code](https://code.visualstudio.com/), or use Cursor if preferred. Open C:/Users/eveli/greenlist. Create a local Git repository in that existing folder and a baseline commit. Review exclusions first: .env and other secrets, local databases, private documents, node_modules, work output and build files must not be committed. The existing ignore file is a starting point, not proof that every sensitive file is excluded.

Use Desktop to publish a PRIVATE repository in your GitHub account after reviewing the files. Never paste credentials into the repository or chat. Create a branch such as website-copy for your changes. Only one editor/agent should change a given set of files at a time.

Done when: the current site has a recoverable baseline and a private remote copy. Repository backup is not a database backup; the latter comes later.

## Step 3 — Start a preview that updates when you save

The previous localhost:3000 preview was a production build. Changing a source file does not update that already-built preview.

In your editor, open the project terminal at C:/Users/eveli/greenlist and run:

```powershell
npm run dev --workspace @greenlist/app -- --port 3001
```

Wait for the Ready message. Open http://localhost:3001/ for the homepage and http://localhost:3001/demo for the sample app. Keep the terminal running. Save source files with Ctrl+S and check this development preview. Stop this preview later with Ctrl+C in its terminal. The demo does not require real provider credentials.

If Node/npm is missing or dependencies cannot be found, stop and have the local setup repaired; do not create a new project. The current computer previously had dependencies installed. Port 3001 avoids disturbing the old 3000 preview. The existing extension remains configured for localhost:3000; do not use the 3001 preview to test authenticated extension connection without rebuilding/configuring it appropriately.

Done when: the homepage and demo open at port 3001 without an error.

## Step 4 — Make your manual wording edits

Use Ctrl+Shift+F in the editor to find the exact phrase displayed on the page. Change one phrase, save, inspect the page and review the change in GitHub Desktop. Commit a small working set before continuing.

| Wording | File under C:/Users/eveli/greenlist |
|---|---|
| Homepage, hero, pricing explanation | apps/app/src/app/page.tsx |
| Dashboard navigation and shortlist | apps/app/src/components/Dashboard.tsx |
| Learning page labels and explanations | apps/app/src/components/LearningPanel.tsx |
| Role explanations | apps/app/src/components/RoleBrief.tsx |
| Role evidence/application panel | apps/app/src/components/RoleDialog.tsx |
| Account and plan | apps/app/src/components/AccountPanel.tsx |
| Privacy/product information | apps/app/src/app/policies/page.tsx |
| Community information | apps/app/src/components/CommunityPanel.tsx |
| Extension popup wording | apps/extension/src/popup.html |
| Extension on-page panel wording | apps/extension/src/content.js |

Example: in `<p>Prepare stronger applications.</p>`, edit the words between the tags while retaining `<p>` and `</p>`. Do not remove braces, quotes or code expressions. Not every quoted string is visible copy: values such as OFFERED and NOT_OFFERED drive application behaviour and must not be renamed as a text edit.

Avoid changing exercise answer keys, eligibility rules, pack allowances or Stripe values as wording changes. Keep pricing and policies consistent across pages. Browser Inspect edits are temporary; source-file edits are persistent. There is currently no Word-style click-to-edit website CMS.

After your changes, run from the project root:

```powershell
npm run typecheck
npm run build:app
```

If a check fails, keep the error and revert or fix the latest small change before committing. Test the relevant desktop and mobile page. Behaviour changes require relevant automated tests too. The previously recorded 68-test result is not automatically a test of your edits.

Done when: your wording is saved, previewed and committed with passing checks.

## Step 5 — Review the business model and arrange human reviewers

Recruit an experienced data analyst to review the exercises and feedback. Arrange conversations with ten target graduates. Obtain advice on the actual paid preparation/work-finding model before finalising charges. Keep matching/community free and paid referrals out of this release. GOV.UK starting points: https://www.gov.uk/employment-agencies-and-businesses and https://www.gov.uk/agency-workers-your-rights/fees

The £15/40-pack preparation tier is provisional. Do not switch on payments just because a setting allows it. Collect operator identity, business address, support details, privacy/retention information and cancellation/refund terms for completion before release.

Done when: reviewers and business-review work are arranged; the completed review is a later payment gate. Account setup can proceed while the review is underway.

## Step 6 — Choose the domain and create service accounts

Shortlist three names, check availability, trademark conflicts and renewal prices, then buy one in your own account. Use a student domain offer if it fits; otherwise [Cloudflare](https://www.cloudflare.com/products/registrar/). Check https://www.gov.uk/search-for-trademark . A free first year is not free renewal, and availability is not brand clearance.

Create these accounts in order, redeeming relevant Pack benefits before paying:

1. [Vercel](https://vercel.com/pricing): website hosting.
2. [Neon](https://neon.com/pricing): managed database.
3. [Clerk](https://clerk.com/): sign-in; check the student Pro redemption.
4. [Anthropic API](https://platform.claude.com/): model access and spending controls; an editor/consumer subscription does not fund customer API use.
5. [Stripe](https://dashboard.stripe.com/register): start with test configuration; redeem eligible fee credits and supply genuine business details.
6. [Resend](https://resend.com/): application emails; separate from a support mailbox.
7. [Sentry](https://sentry.io/): error monitoring if the student offer is suitable.

Use Vercel Blob in your hosting account for private files. Establish a working support mailbox. Store credentials privately. No AWS account is required for this chosen architecture.

Budget remains £300/month in ceilings: data £100, AI £50, hosting/database/storage £60, accounts/email/monitoring £30, contingency £60. These are allocations, not vendor quotes. Domain renewal, payment fees, legal/content review, labour and optional editor subscriptions are separate. Track student-offer expiry dates and post-offer costs.

Done when: you own the domain and accounts and can configure credentials privately.

## Step 7 — Connect and deploy a closed pilot environment

Implementation work: connect private GitHub code to Vercel; configure Neon and apply migrations; configure Clerk sign-in and redirect addresses; set administrator access; connect private Blob storage; configure Anthropic model, rates and budgets; connect Stripe test webhooks/portal; set Resend domain authentication and support reply address; add monitoring with personal-data scrubbing.

Choose one canonical HTTPS website origin, set APP_URL centrally, connect DNS and verify HTTPS. Keep development and production keys/data separate. Configure scheduled job/register refreshes and email processing. Set spending alerts. Complete a backup and restoration rehearsal. Keep checkout closed and use test payments.

Done when: you can sign in to the closed pilot, save private data, use real AI, receive a test service email and complete test checkout/cancellation.

## Step 8 — Enable verified live jobs

Refresh the September register snapshot from https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers . Review candidate legal names against official websites/careers pages, record exact board identifiers, and resolve ambiguity. The existing 100 names are a research queue, not 100 reviewed employers.

Establish permission for display, caching, attribution, AI processing and refresh/deletion rules. Start with approved Greenhouse/Lever feeds; add Adzuna only within its agreed terms and £100 monthly ceiling. No permission enquiries have been sent on your behalf. Links: https://docs.greenhouse.io/job-board.html , https://github.com/lever/postings-api , https://developer.adzuna.com/docs/terms_of_service .

Inspect coverage, duplicates, dates and closures; a failed feed must not close its whole inventory. Keep licence status separate from vacancy sponsorship policy. Do not advertise universal real-time coverage or infer historical sponsor volumes.

Done when: real UK graduate data roles appear with reviewable evidence and freshness, rather than sample jobs.

## Step 9 — Test the existing Chrome extension privately

Already present: Manifest V3 extension, Greenhouse/Lever host support, authenticated seven-day connection tokens, supported contact/education/current-employment fields and exact-label user-approved answers. It preserves existing input and never submits. Workday, arbitrary websites, file uploads and ambiguous/repeated/sensitive fields are not supported autofill promises.

Local inspection can happen earlier: open chrome://extensions, enable Developer mode, click Load unpacked, choose C:/Users/eveli/greenlist/apps/app/work/extension-build. This is an existing development build, not a published store item. Loading it does not establish authentication or prove filling works. See https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world .

For a working end-to-end test after Step 7:

1. Set the intended website origin and rebuild with `npm run extension:build` from C:/Users/eveli/greenlist/apps/app. This writes work/extension-build; changing source alone does not update that generated copy.
2. Load that folder in Chrome, or click Reload on the existing unpacked extension after rebuilding. Refresh the application-form tab after content-script edits.
3. Sign into the actual Greenlist account; complete and approve profile details. The demo cannot issue real credentials.
4. In Account & plan, generate a seven-day connection token. Paste it into the extension popup only. Confirm the connection. Test revocation and expiry.
5. On a supported employer form, click Fill my details. Review filled and skipped fields; check existing answers remain untouched.
6. Prepare and save reviewed answers for that exact vacancy before testing answer autofill. Verify answers do not leak onto another job.
7. Check manual uploads, required questions and eligibility answers. Submission is always the user's action. Confirm submission in the tracker only after it actually happens.
8. Test real forms as well as synthetic fixtures. Do not submit test applications to employers.

Done when: the approved ordinary-field set passes representative real-form checks, including partial forms, errors, expiry and sign-out. Expand additional ATS support only as separately tested work.

## Step 10 — Complete real-world release evaluation

- 100 real vacancies: zero unsupported sponsorship-offered labels; include ambiguity, refusals, conditions, stale jobs, closures and duplicates.
- 20 real Greenhouse/Lever forms: target at least 95% accuracy for supported ordinary fields, preserve input, no automatic submission.
- 30 real preparation packs plus interview-feedback evaluation: no unsupported personal claims, useful edits, saved revisions and correct failure/quota handling.
- Experienced analyst review of curriculum and marking; evaluate learning with graduates rather than treating a short quiz as certification.
- Account isolation, private downloads, export/deletion, database restoration, scheduler and email failures.
- Stripe successful/failed purchases, authentication, renewals, duplicate/out-of-order webhooks, cancellation and access through the paid period.
- Complete operator, privacy, support and subscription/refund information; complete business-model review.

Done when: evidence is recorded for each gate. Automated tests and configuration flags do not replace these checks.

## Step 11 — Package and submit the Chrome Web Store release

Owner registers a Chrome Web Store developer account, completes required verification/contact declarations and pays the one-time registration fee shown at registration: https://developer.chrome.com/docs/webstore/register/ . This is separate from Stripe or hosting. Private unpacked testing does not require publishing.

Implementation work: rebuild for the real HTTPS origin, remove development origins from the release package, verify permissions are minimal, increment the extension version, prepare icons/screenshots/description, privacy policy and accurate data-use declarations, provide reviewer access/instructions where requested, and upload the ZIP with manifest.json at its root. Do not include secrets, tokens, database files or unrelated project folders.

Declare the profile/application data accessed, transmitted and stored. Explain the specific autofill purpose and supported sites. Disclose external AI processing accurately where relevant. Submit for review, resolve any findings and install the store version for a final smoke test. No approval date is guaranteed. Instructions: https://developer.chrome.com/docs/webstore/publish ; data policy: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq .

Replace the pilot ZIP download with the approved store link once available. Test updates, account connection and the final domain again. Do not represent the development ZIP as store-approved.

Done when: the intended users have a tested installation route and the listing accurately describes the extension.

## Step 12 — Run the measured paid pilot

Recruit 20 activated users after release gates; enable £15 preparation billing only after the business model is approved. Aim for five paying users and at least half of still-searching paying users meaningfully active in week four. Track real useful actions, feedback, cost per user and cancellation reasons. Do not count logins alone as value.

Set up the optional free Discord community with a human moderator, reporting rules and no paid-referral promises. Retain users with suitable new jobs, progress, useful practice and saved application context. Preserve the free tracker after cancellation. Finding a job is successful completion, not a retention failure.

Done when: four weeks of evidence support continuing, changing the offer or stopping. Only then consider a higher tier, more countries, voice practice or custom community infrastructure.

## Your first session — do only this

1. Select VS Code/Copilot Student or your preferred editor.
2. Protect the current project with Git history/private backup.
3. Start the development preview at port 3001.
4. Edit one homepage sentence, save, inspect and commit it.

Then continue with Step 5. You do not need to redeem every offer or connect every service before making that first text edit.
