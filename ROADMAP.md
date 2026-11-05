# Greenlist Development Roadmap (350-Hour Plan)

This roadmap outlines the planned independent engineering work required to improve the initial local prototype (currently focused on data analyst roles with mocked data) into a production-ready platform covering the full spectrum of UK international graduate job barriers aimed at international graduates.

**Total Estimated Effort:** ~350 Hours

---

## Phase 1: Visa & Systemic Barrier Engine (~80 Hours)
Expanding beyond basic sponsor licence matching to build a sequential eligibility and restriction engine.
* **Algorithmic Eligibility & Barrier Routing (30h):** Build validation logic in `apps/app` to filter roles against systemic UK barriers: Skilled Worker salary thresholds (£38,700 baseline vs. New Entrant 30% discounts), SOC 2020 occupation code going rates, and automated detection/exclusion of Security Clearance (SC / DV / UK Eyes Only) constraints.
* **Sponsor Register Automation & Entity Resolution (25h):** Upgrade `register:import` scripts and Prisma schemas to support automated daily diffs of the Home Office Licensed Sponsors CSV, tracking licence revocations, rating downgrades, and matching trading names to legal entities.
* **IHS & Financial Pathway Calculator (15h):** Implement interactive tools and user state tracking for upfront visa costs, Immigration Health Surcharge (IHS) estimates, employer clawback agreement tracking, and UKCISA Graduate Route employer education packs.
* **Automated Live Job Feed Ingestion (10h):** Connect permitted live job feeds, replacing demo vacancies with an automated ingestion, deduplication, and sponsorship-wording classification pipeline.

---

## Phase 2: CV Parsing, Prioritised Pathways & Multi-Role Expansion (~90 Hours)
Improve the current static 15-question data analyst diagnostic and turn it into a dynamic, CV-driven pathway generation across multiple graduate disciplines accustomed to each unique graduate.
* **CV Parsing & Structured Experience Extraction (35h):** Build document upload and parsing pipelines in Next.js server routes to extract user skills, education, visa timelines, and approved experience facts directly from PDF/DOCX CVs into the PostgreSQL database.
* **Sequential Pathway Generator (25h):** Develop the core state machine that takes a user's parsed CV and target goal, identifies their highest-priority bottleneck (visa eligibility, ATS readiness, technical skill gaps, or assessment centre prep), and generates a step-by-step resolution pathway.
* **Diagnostic & Upskilling Expansion (30h):** Expand the diagnostic engine and reassessment modules beyond Data Analyst roles (SQL, spreadsheets, statistics) to support Software Engineering, Finance, and Civil Engineering graduate pathways, including UK psychometric and Situational Judgement Test (SJT) practice flows.

---

## Phase 3: Chrome Extension & ATS Expansion (~60 Hours)
Upgrading `apps/extension` to handle complex UK graduate scheme application portals.
* **Workday & Taleo DOM Adapters (30h):** Extend the Chrome extension beyond Greenhouse and Lever to support multi-page Workday and Taleo application flows commonly used by UK FTSE 250 sponsors, maintaining the strict user-review and non-auto-submit safety rules.
* **Right-to-Work & Sponsorship Field Intelligence (15h):** Add intelligent detection for standard UK visa screening questions ("Do you now or in the future require sponsorship?") to surface tailored guidance based on the user's Graduate Route vs. Skilled Worker transition timeline.
* **Extension-to-Dashboard Sync & E2E Testing (15h):** Harden authentication and state synchronization between `apps/extension` and `apps/app`, adding comprehensive automated browser tests.

---

## Phase 4: Production Infrastructure, Verification & Security (~70 Hours)
Completing the production readiness and release checks outlined in the project documentation.
* **Database Migration & Integration Suite (25h):** Transition local PGlite workflows to managed production PostgreSQL, expand Prisma migration safety checks, and unskip/complete the full database integration test suites.
* **AI Evaluation & Guardrail Harness (25h):** Replace mocked provider responses in tests with an evaluation harness to validate 30+ real AI preparation packs, enforcing strict fact-grounding (preventing hallucinated achievements) and per-user token budget controls.
* **Auth, Billing & Compliance Hardening (20h):** Finalize Clerk production authentication, Stripe checkout integration, GDPR/UK data privacy document storage, automated account deletion workflows, and backup recovery verification.

---

## Phase 5: Pilot ReleaseValidation & Performance (~50 Hours)
* **Release Gate Verification (30h):** Execute and document the required release checks across 100 real live vacancies and 20 full end-to-end application forms, resolving edge-case bugs in role briefs and parser accuracy.
* **Accessibility, UI Polish & Documentation (20h):** Audit desktop and mobile dashboard responsiveness, refine user onboarding flows, and synchronize all setup and architecture documentation in `docs/`.
