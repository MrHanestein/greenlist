import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { HttpError } from './http';
export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new HttpError(401, 'Sign in to continue');
  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing?.deletingAt) throw new HttpError(409, 'Account deletion is in progress');
  if (existing) return existing;
  const account = await currentUser();
  const email = account?.emailAddresses.find(e => e.id === account.primaryEmailAddressId && e.verification?.status === 'verified')?.emailAddress;
  if (!email) throw new HttpError(400, 'Add a verified email to your account');
  return prisma.user.upsert({ where: { clerkId: userId }, update: {}, create: { clerkId: userId, email, name: account?.fullName } });
}
