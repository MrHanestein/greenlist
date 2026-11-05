import { clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest,type NextFetchEvent } from 'next/server';
const publicRoute=createRouteMatcher(['/','/policies','/sign-in(.*)','/sign-up(.*)','/sponsors','/api/sponsors','/api/sponsors/refresh','/api/sponsors/archive','/api/jobs/ingest','/api/notifications/refresh','/api/webhooks/(.*)','/api/autofill/(.*)','/demo']);
const withClerk=clerkMiddleware(async(auth,req)=>{if(!publicRoute(req))await auth.protect();});
export default function middleware(req:NextRequest,event:NextFetchEvent){
 if(!['GET','HEAD','OPTIONS'].includes(req.method)){
  const origin=req.headers.get('origin');
  if(origin && origin!==req.nextUrl.origin && origin!==process.env.APP_URL && !['/api/autofill/profile','/api/autofill/log'].includes(req.nextUrl.pathname))return NextResponse.json({error:'Invalid origin'},{status:403});
 }
 if(!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY){
  if(publicRoute(req))return NextResponse.next();
  if(req.nextUrl.pathname==='/dashboard')return NextResponse.redirect(new URL('/sign-in',req.url));
  return NextResponse.json({error:'Accounts are not configured yet'},{status:503});
 }
 return withClerk(req,event);
}
export const config={matcher:['/((?!_next|.*\\..*).*)','/(api|trpc)(.*)']};
