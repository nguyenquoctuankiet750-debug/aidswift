'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Lấy dữ liệu hồ sơ công ty
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
        console.warn('⚠️ Không thể đọc session localStorage', e);
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) console.error('Lỗi tải hồ sơ công ty:', error);
      else if (!data) {
        const emptyProfile = {
          id: user.id,
          email: user.email,
          company_name: '',
          phone: '',
          address: '',
          website: '',
          description: '',
        };
        const { error: insertErr } = await supabase
          .from('company_profiles')
          .insert(emptyProfile);
        if (insertErr) console.error('Lỗi tạo hồ sơ trống:', insertErr);
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

  // 🔹 Lưu hồ sơ công ty
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { error } = await supabase
        .from('company_profiles')
        .upsert({ id: user.id, ...profile });

      if (error) throw error;
      alert('✅ Đã lưu hồ sơ công ty thành công!');
    } catch (err) {
      console.error(err);
      alert('❌ Lỗi khi lưu hồ sơ công ty: ' + (err?.message || err));
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
        ⏳ Đang tải hồ sơ công ty...
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Không tìm thấy hồ sơ công ty.
      </div>
    );

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-gradient-to-br from-green-50 to-white shadow-xl rounded-2xl p-8 mt-10 border border-gray-200"
      >
        <h1 className="text-3xl font-bold text-green-700 text-center mb-2">
          🏢 Hồ sơ công ty
        </h1>
        <p className="text-center text-gray-500 mb-6">{profile.email}</p>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            ['company_name', 'Tên công ty'],
            ['phone', 'Số điện thoại'],
            ['address', 'Địa chỉ'],
            ['website', 'Website công ty'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-gray-700 font-medium mb-1">
                {label}
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                value={profile[key] || ''}
                onChange={(e) =>
                  setProfile({ ...profile, [key]: e.target.value })
                }
                placeholder={label}
              />
            </div>
          ))}

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mô tả công ty
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 h-28 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={profile.description || ''}
              onChange={(e) =>
                setProfile({ ...profile, description: e.target.value })
              }
              placeholder="Giới thiệu ngắn gọn về công ty..."
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 rounded-lg font-semibold shadow transition-all duration-200 ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {saving ? '💾 Đang lưu...' : 'Lưu hồ sơ'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-all duration-200"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
