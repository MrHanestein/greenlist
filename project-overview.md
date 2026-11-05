# Greenlist: Project Overview & Architecture

## 1. Problem Statement
International graduates in the United Kingdom face difficulties in today's job market. Standard job boards fail to account for systemic immigration and regulatory barriers, resulting in wasted applications. Key barriers include:
* **Sponsor Licence vs. Vacancy Eligibility:** An employer holding a Home Office Skilled Worker licence does not guarantee that a specific junior role meets the £38,700 salary threshold, qualifies for the 30% New Entrant discount, or matches an eligible SOC 2020 occupation code.
* **Security Clearance Restrictions:** Roles in defence, aerospace, and government contracting frequently require SC (Security Check) or DV (Developed Vetting) clearance, which mandate 5 to 10 years of UK residency or British citizenship.
* **Financial & Administrative Hurdles:** High upfront Immigration Health Surcharge (IHS) fees, employer unfamiliarity with the 2-year Graduate Route (UKCISA guidelines), and rigid UK psychometric/assessment centre filtering.

## 2. The Solution
Greenlist is an evidence-first web platform and browser extension that bridges the gap between job discovery, visa feasibility, and candidate readiness. Instead of operating as a generic job board, Greenlist ingests a candidate's CV and target career goals to construct a prioritised, sequential pathway that addresses their specific bottlenecks before they apply.

## 3. Core System Architecture

The repository is structured as a pnpm monorepo containing the following core workspaces:

### Web Application (`apps/app`)
* **Framework:** Next.js (App Router) with TypeScript.
* **Database & ORM:** PostgreSQL (managed in production, PGlite for local development) interfaced via Prisma (`apps/app/prisma`).
* **Authentication:** Clerk for user session and profile management.
* **Key Modules:**
  * **Sponsor & Vacancy Engine:** Separates raw Home Office Sponsor Register records from individual job description wording, highlighting explicit vs. inferred sponsorship rules.
  * **Diagnostic & Learning Workflows:** Interactive assessments (initially targeting Data Analyst competencies across SQL, spreadsheets, statistics, and business metrics) that generate targeted study plans and track reassessment progress.
  * **Fact-Grounded AI Preparation:** Integrates the Anthropic API to provide written interview feedback and tailored application answers. Strictly constrained to user-approved experience facts to prevent hallucinated achievements.

### Browser Extension (`apps/extension`)
* **Purpose:** Assists candidates during the final application stage on supported Applicant Tracking Systems (currently Greenhouse and Lever, expanding to Workday and Taleo).
* **Safety & Control:** Maps approved user profile data and prepared answers into form fields for review. It preserves existing user input and strictly prohibits automated form submission.

### Data & Operational Scripts (`apps/app/scripts`)
* Contains CLI utilities for importing and diffing official Home Office sponsor register CSV snapshots (`register:import`), local database orchestration, and extension packaging.

## 4. Current Status & Production Readiness
Greenlist is currently a functional local prototype backed by automated unit, build, and browser verification checks. Moving to production requires completing the 350-hour engineering backlog detailed in [ROADMAP.md](../ROADMAP.md), including connecting permitted live vacancy feeds, expanding the CV-to-pathway state machine, unmocking AI evaluation harnesses, and completing end-to-end user release checks.
