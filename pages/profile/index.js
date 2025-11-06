import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';

export default function ProfileIndex() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) { router.push('/login'); return; }
      // fetch profile to get role
      const res = await fetch('/api/profile-role'); // we'll add this API
      const roleData = await res.json();
      const role = roleData?.role || 'user';
      router.push(/profile/);
    })();
  }, [router]);

  return <div>Redirecting...</div>;
}
