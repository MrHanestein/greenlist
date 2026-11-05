# Greenlist

Greenlist helps international graduates understand which UK jobs are worth applying for and prepare for the work and interviews behind them. The first version focuses on data analyst roles.

I started this project because applying for jobs as an international graduate can be confusing. A company can hold a sponsor licence without offering sponsorship for a particular job. Job descriptions can also leave you unsure about what you need to learn or how to prepare. Greenlist brings that information together and helps people decide what to do next.

## Where the project is now

This is a working local prototype. It is not a launched service. Payments are closed and the last recorded live vacancy count was zero. Jobs in the demo are examples.

The application, Chrome extension source, database migrations, tests and research notes are included here. Production accounts, permitted job feeds and reviews by real users still need to be connected and completed.

## What you can try

- Look through example jobs and see employer licence information separately from the vacancy's sponsorship wording.
- Save approved experience and use it when preparing application answers and CV suggestions.
- Complete a short data analyst diagnostic, review feedback and follow a shared learning plan.
- Save practice and reassessment attempts across SQL reasoning, spreadsheets, charts, statistics and business metrics.
- Read role briefs that distinguish what the employer says from what Greenlist infers.
- Rehearse written interview answers and request optional AI feedback when an Anthropic API account is configured.
- Track applications and keep the version you confirm you submitted.
- Use the desktop Chrome extension to fill supported Greenhouse and Lever fields for review. It preserves existing answers and never submits an application.

The diagnostic has fifteen original multiple-choice questions. It is a small starting exercise, not a professional skills certificate. Workday, voice interviews and automatic applications are outside the current version.

## Run the demo

You need Node.js 22 or newer and npm. Open a terminal in this project folder.

```sh
npm ci
npm run db:generate
```

Copy `apps/app/.env.example` to `apps/app/.env` if you do not already have a local configuration. Keep your existing file if you have one. Never commit real API keys.

```sh
npm run dev:app
```

Open [the local demo](http://localhost:3000/demo). Select **Learn & prepare** to try the learning workflow. You can also open [the homepage](http://localhost:3000/).

The demo uses example data. The authenticated dashboard needs Clerk and a database. Live AI feedback needs an Anthropic API key and a configured model.

## Run the local database

From `apps/app`, start the development database in a separate terminal.

```sh
npm run db:local
```

Keep that terminal open. In another terminal, from the project root, apply the migrations.

```sh
npm run db:deploy
```

The example database URL is for local development only. It includes the connection settings needed by the bundled PGlite server. Use managed PostgreSQL for a deployed service.

To import an official sponsor register CSV, run this from `apps/app`, replacing the example path and date with your file and its snapshot date.

```sh
npm run register:import -- "C:/path/to/register.csv" YYYY-MM-DD
```

The original CSV and the local database are not included in Git. A licence record does not establish that a vacancy offers sponsorship or that a candidate qualifies for a visa.

## Find your way around

| Folder | What it contains |
| --- | --- |
| `apps/app` | The Next.js website, dashboard and server routes |
| `apps/app/prisma` | Database schema and migrations |
| `apps/app/scripts` | Imports, checks, local database tools and extension packaging |
| `apps/extension` | Chrome extension source |
| `apps/marketing` | Earlier standalone marketing files |
| `docs` | Setup notes, implementation details and release checks |
| `docs/research` | Employer research candidates and analyst review material |

The Next.js homepage is the current website. The earlier marketing files are retained for reference.

## How AI is used

The app has an Anthropic API integration for application preparation and optional written interview feedback. Application answers should reference facts the user has approved. Suggestions remain editable and must not silently become personal achievements. Usage limits and a shared budget help control costs.

Real AI responses still need evaluation before launch. The automated tests use mocked provider responses.

## Before people pay

The next work is to connect real services, review employer identities and establish permission for the job feeds. Then test the complete journey with target users.

The release checks include 100 real vacancies, 20 real application forms and 30 real AI preparation packs. An experienced analyst still needs to review the learning material. Billing, private documents, account deletion and backup recovery also need testing with the actual services.

Job research and matching remain free. The proposed paid service is preparation, subject to business and legal review. Checkout stays closed until the required reviews and configuration are complete. No hiring outcome or sponsorship is promised.

The scheduled GitHub workflow is off by default. Enable it only after configuring the required services, repository secrets and `GREENLIST_SCHEDULE_ENABLED` repository variable. Manual runs also require valid service configuration.

## Checks

From the project root:

```sh
npm run typecheck
npm test
npm run build:app
```

Database integration tests need a dedicated local test database. Do not point them at production. See the setup notes for the integration and browser checks.

On 5 November 2026, TypeScript checks passed and the default test run passed 46 tests with one database integration suite skipped. No real AI provider was called in that run.

The last recorded full verification on 14 September 2026 reported 68 passing automated tests, a passing production build and desktop and mobile browser checks. AI calls were mocked. That is a historical result, not a claim that real providers or the release checks have passed.

## Read next

- [Project overview](docs/PROJECT-OVERVIEW.md)
- [Learning workflow and outstanding work](docs/DATA-ANALYST-IMPLEMENTATION.md)
- [Service setup](docs/PAID-PILOT-SETUP.md)
- [Employer research candidates](docs/research/EMPLOYER-CANDIDATES.md)
- [Analyst review rubric](docs/research/ANALYST-REVIEW-RUBRIC.md)
- [Development Roadmap (350-Hour Plan)](./ROADMAP.md)
- [Project overview](./docs/project-overview.md)

Some setup documents record earlier plans. Where prices, limits or release status differ, use this README and the dated learning implementation notes as the current project summary. Check service pricing before purchasing anything.
