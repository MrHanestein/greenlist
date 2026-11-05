import { requireUser } from './user';
import { HttpError } from './http';
export async function requireAdmin(){const user=await requireUser();const ids=(process.env.ADMIN_CLERK_IDS??'').split(',').map(s=>s.trim()).filter(Boolean);if(!ids.includes(user.clerkId))throw new HttpError(403,'Administrator access required');return user;}
