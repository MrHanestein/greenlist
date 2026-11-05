# Data analyst pilot implementation — 14 September 2026

## Implemented locally

- Learn & prepare dashboard section: versioned diagnostic, practice and reassessment; save/resume; written reflections; individual skill evidence; reusable learning plan based on selected roles and weekly hours.
- Fifteen original multiple-choice questions across five analyst skills. These are a small reasoning screen, not a practical proficiency certification. Content is explicitly awaiting professional review. No user SQL executes.
- Sourced advert excerpts and clearly labelled inferred tasks in role dialogs. Sponsorship history remains unavailable rather than invented.
- Application-priority explanations in the learning section. A sponsorship refusal overrides sampled skills. Future-only sponsorship needs require employer confirmation even if the advert offers sponsorship currently.
- Private written interview rehearsal with saved submitted application context. Optional Anthropic feedback quotes the response, gives uncertainty, a next task and a follow-up question. Ten feedback responses per calendar month during the free pilot. User chooses whether to send a saved answer for feedback.
- Shared AI budget across packs and interviews. Failure refunds the correct user allowance; uncertain provider cost is conservatively retained. Expired jobs refund their own usage kind. Cached feedback does not spend another response.
- Learning export and deletion cascade, ownership checks, revision conflict handling and content-free activity events.
- Job matching and opt-in search notifications no longer depend on Plus. Up to ten daily shortlisted jobs for both tiers. Paid preparation remains provisional.
- Checkout requires BUSINESS_MODEL_REVIEWED=true as well as the existing pilot, provider and business setup gates. Existing-customer portal access is not blocked by these flags.

## Research outputs

See research/EMPLOYER-CANDIDATES.md and employer-candidates.json for 100 register-derived research candidates, research/RESEARCH-AND-RELEASE.md for observed career sources and permissions enquiry, and research/ANALYST-REVIEW-RUBRIC.md for curriculum review.

The candidate directory is not 100 verified employer identities. Careers connections and commercial rights remain pending. Four employer brands received an initial careers-source pass. No 100-vacancy review has been completed. No feeds were enabled; current local live job count remains zero.

## Required to connect

Owner creates Vercel, Neon, Clerk, Anthropic, Stripe and Resend accounts, chooses a domain and provides credentials through environment settings rather than chat. Use existing setup guide for provider fields. Set ANTHROPIC_MODEL and its GBP-equivalent input/output token rates. The model is configurable and must pass real quality evaluation. Never enable paid checkout solely because a configuration check passes.

Create Discord under the owner's account and provide NEXT_PUBLIC_COMMUNITY_URL only after rules and human moderation are ready. No server was created or invitations sent. No AWS account is needed for this architecture.

## Outstanding release work

Actual provider configuration, model quality checks, experienced analyst review, legal/business-model review, employer identity/rights review, the 100-vacancy evaluation, 20 real forms, 30 real packs, production private-file/deletion/billing tests and backup restore. A second paid tier, paid referrals, other countries, voice interviews, practical SQL execution and candidate-reported interview databases are deferred.

The prototype records per-skill exercise evidence rather than claiming a probability of employment. Repeating a small public question bank can be memorised. Real assessment validity and transfer to applications require human evaluation.

## Verification this turn

68 automated tests passed with local database integration enabled and no skipped tests. TypeScript checks and production build passed. Existing application browser journey passed. New learning browser journey passed desktop/mobile after correcting horizontal overflow: saved preferences, draft resume after reload, marking, skill evidence and interview history. AI provider calls in tests were mocked; no real-provider quality claim is made.

