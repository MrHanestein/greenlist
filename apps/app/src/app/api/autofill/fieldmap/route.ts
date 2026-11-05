import { endpoint,HttpError } from '@/lib/http';
export const GET=endpoint(async()=>({supported:['greenhouse','lever'],maps:[]}));
export const POST=endpoint(async()=>{throw new HttpError(410,'Field-map submissions are not enabled');});