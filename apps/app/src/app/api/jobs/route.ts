import { endpoint } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { shortlist } from '@/lib/shortlist';
export const GET=endpoint(async()=>({jobs:await shortlist(await requireUser())}));