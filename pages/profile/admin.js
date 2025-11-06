import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function AdminProfile() {
  const [users, setUsers] = useState([]);
  const [sosList, setSosList] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from('profiles').select('*').limit(200);
      setUsers(p || []);
      const { data: s } = await supabase.from('sos').select('*').order('created_at', { ascending: false }).limit(200);
      setSosList(s || []);
    })();
  }, []);

  return (
    <>
      <Navbar />
      <div className='max-w-6xl mx-auto p-6'>
        <h2 className='text-2xl font-bold mb-4'>Admin</h2>

        <section className='mb-6'>
          <h3 className='font-semibold'>Users</h3>
          <div>
            {users.map(u => <div key={u.id} className='border p-2 my-1'>{u.email} â€” {u.role}</div>)}
          </div>
        </section>

        <section>
          <h3 className='font-semibold'>Recent SOS</h3>
          <div>
            {sosList.map(s => <div key={s.id} className='border p-2 my-1'>{s.message} â€” {s.latitude},{s.longitude}</div>)}
          </div>
        </section>
      </div>
    </>
  );
}
