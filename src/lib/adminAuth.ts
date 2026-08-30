import { createClient } from './supabaseServer';

export async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { isAuthorized: false, user: null, reason: 'unauthenticated' };
  }

  const adminEmailsStr = process.env.WHALE_ADMIN_EMAILS || '';
  const adminEmails = adminEmailsStr.split(',').map((email) => email.trim().toLowerCase());

  const userEmail = user.email?.toLowerCase();

  if (!userEmail || !adminEmails.includes(userEmail)) {
    return { isAuthorized: false, user, reason: 'unauthorized' };
  }

  return { isAuthorized: true, user, reason: null };
}
