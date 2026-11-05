try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}
const checks={
 'Business-model review recorded':process.env.BUSINESS_MODEL_REVIEWED==='true',
 'Managed database':!!process.env.DATABASE_URL&&!/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL),
 'Canonical HTTPS domain':/^https:\/\/[^/]+$/.test(process.env.APP_URL||''),
 'Production sign-in':!!process.env.CLERK_SECRET_KEY&&!!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
 'Stripe secret, webhook and price':!!process.env.STRIPE_SECRET_KEY&&!!process.env.STRIPE_WEBHOOK_SECRET&&!!process.env.STRIPE_PRICE_PLUS,
 'AI model, key and cost rates':!!process.env.ANTHROPIC_API_KEY&&!!process.env.ANTHROPIC_MODEL&&Number(process.env.AI_INPUT_GBP_PER_MILLION)>0&&Number(process.env.AI_OUTPUT_GBP_PER_MILLION)>0,
 'Administrator allowlist':!!process.env.ADMIN_CLERK_IDS,
 'Verified email configuration':!!process.env.RESEND_API_KEY&&!!process.env.ALERT_FROM,
 'Independent scheduler and extension secrets':(process.env.CRON_SECRET||'').length>=32&&(process.env.AUTOFILL_API_TOKEN_SECRET||'').length>=32&&process.env.CRON_SECRET!==process.env.AUTOFILL_API_TOKEN_SECRET,
};
for(const [label,ready] of Object.entries(checks))console.log((ready?'PASS':'NEEDS SETUP')+' '+label);
console.log('Still required: commercial feed evidence, 100 real vacancies, 20 real forms, 30 reviewed AI packs, live-provider billing tests, privacy/terms review and a backup restore. This command does not certify those gates.');
if(Object.values(checks).some(v=>!v))process.exitCode=1;
