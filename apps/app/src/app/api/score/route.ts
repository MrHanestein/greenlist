import { endpoint } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { shortlist } from '@/lib/shortlist';
// Ranking is deterministic, explainable and restricted to the customer's shortlist.
export const POST=endpoint(async()=>({jobs:await shortlist(await requireUser())}));