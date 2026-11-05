import { endpoint,body } from '@/lib/http';
import { z } from 'zod';
import { requireUser } from '@/lib/user';
export const POST=endpoint(async req=>{await requireUser();const {text}=await body(req,z.object({text:z.string().min(10).max(30000)}));const candidates=text.split(/\n\s*\n/).map(s=>s.trim()).filter(s=>s.length>=10&&s.length<=3000).slice(0,20).map((body,i)=>({title:'CV example '+(i+1),body}));return {candidates,notice:'These are verbatim CV excerpts, not verified facts. Edit and approve each example before saving.'};});
