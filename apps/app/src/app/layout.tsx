import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata={title:'Greenlist — A clearer path to your next role',description:'Evidence-led job search and application tools for international graduates in the UK.'};
export default function RootLayout({children}:{children:ReactNode}){const content=<html lang="en-GB"><body>{children}</body></html>;return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?<ClerkProvider>{content}</ClerkProvider>:content;}