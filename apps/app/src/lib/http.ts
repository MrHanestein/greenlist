import { NextResponse } from 'next/server';
import { z } from 'zod';
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function endpoint(fn: (req: Request) => Promise<unknown>) { return async (req: Request) => {
  try { const result = await fn(req); return result instanceof Response ? result : NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } }); }
  catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError || e instanceof SyntaxError) return NextResponse.json({ error: 'Check the submitted fields and try again.' }, { status: 400 });
    console.error('Request failed', e instanceof Error ? e.name : 'unknown');
    return NextResponse.json({ error: 'This request could not be completed. Please try again.' }, { status: 500 });
  }
}; }
export async function body<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> { const raw = await req.text(); if (raw.length > 120000) throw new HttpError(413, 'Request too large'); return schema.parse(JSON.parse(raw)); }
export function requireCron(req: Request) { const secret = process.env.CRON_SECRET; if (!secret || secret.length < 32 || req.headers.get('x-cron-secret') !== secret) throw new HttpError(401, 'Unauthorized'); }
