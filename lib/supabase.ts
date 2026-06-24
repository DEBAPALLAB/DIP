import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail loudly rather than silently degrade to a placeholder client.
// A "working" auth gate backed by a fake client is a silent auth bypass
// (see SECURITY_AUDIT.md F7). In the browser we warn; on the server we throw.
if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  const msg =
    'Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
  if (typeof window === 'undefined') {
    throw new Error(msg);
  } else {
    // eslint-disable-next-line no-console
    console.error(msg);
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);
