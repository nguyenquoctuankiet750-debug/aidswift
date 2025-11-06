// pages/profile/user.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';

export default function UserProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restoreAndLoad = async () => {
      try {
        const stored = localStorage.getItem('supabase.auth.session');
        if (stored) {
          const session = JSON.parse(stored);
          await supabase.auth.setSession(session);
        }
      } catch (e) {
        console.warn('Không thể khôi phục session:', e);
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) console.error('Lỗi lấy profile:', error);
      else if (!data) {
        const emptyProfile = {
          id: user.id,
          email: user.email,
          full_name: '',
          phone: '',
          address: '',
          disability_type: '',
          disability_level: '',
        };
        const { error: insertErr } = await supabase
          .from('user_profiles')
          .insert(emptyProfile);
        if (insertErr) console.error('Lỗi tạo profile rỗng:', insertErr);
        else setProfile(emptyProfile);
      } else {
        setProfile(data);
      }

      if (mounted) setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.push('/login');
    });

    restoreAndLoad();

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, [router]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ id: user.id, ...profile });
      if (error) throw error;
      alert('✅ Hồ sơ đã được lưu thành công!');
    } catch (err) {
      console.error(err);
      alert('❌ Có lỗi xảy ra khi lưu: ' + (err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.session');
    router.push('/login');
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Đang tải thông tin người dùng...
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Không tìm thấy hồ sơ.
      </div>
    );

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-2xl p-8 mt-10 border border-gray-200"
      >
        <h1 className="text-3xl font-semibold text-center text-blue-700 mb-2">
          Hồ sơ người dùng
        </h1>
        <p className="text-center text-gray-500 mb-6">{profile.email}</p>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            ['full_name', 'Họ và tên'],
            ['phone', 'Số điện thoại'],
            ['address', 'Địa chỉ'],
            ['disability_type', 'Loại khuyết tật'],
            ['disability_level', 'Mức độ khuyết tật'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-gray-700 font-medium mb-1">
                {label}
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={profile[key] || ''}
                onChange={(e) =>
                  setProfile({ ...profile, [key]: e.target.value })
                }
                placeholder={label}
              />
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-semibold shadow transition-all duration-200 ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saving ? 'Đang lưu...' : '💾 Lưu hồ sơ'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-all duration-200"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
