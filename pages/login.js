'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import { loadModels, getFaceDescriptor, compareFaces } from '../utils/faceModel';

export default function LoginPage() {
  const videoRef = useRef(null);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('🔵 Đang khởi tạo camera...');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isChoosingType, setIsChoosingType] = useState(false);
  const [foundUserId, setFoundUserId] = useState(null);

  const DEFAULT_PASSWORD = 'default123';

  // 🚀 Tải mô hình nhận diện khuôn mặt
  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        setIsModelLoaded(true);
        setStatus('✅ Mô hình nhận diện sẵn sàng!');
        startVideo();
      } catch (err) {
        setStatus('❌ Lỗi tải model: ' + (err?.message || err));
      }
    };
    init();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setStatus('❌ Không thể mở camera: ' + (err?.message || err));
    }
  };

  // ✅ Tạo profile mặc định nếu chưa có
  const ensureProfileExists = async (userId, type, email) => {
    const table = type === 'user' ? 'user_profiles' : 'company_profiles';
    const { data } = await supabase.from(table).select('id').eq('id', userId).maybeSingle();
    if (!data) {
      const profileData =
        type === 'user'
          ? { id: userId, email, full_name: '', phone: '', address: '', disability_type: '', disability_level: '' }
          : { id: userId, email, company_name: '', phone: '', address: '', website: '', description: '' };
      await supabase.from(table).insert(profileData);
    }
  };

  // 🧠 Đăng ký
  const handleRegister = async () => {
    try {
      if (!email) return alert('⚠️ Vui lòng nhập email!');
      setStatus('📸 Đang quét khuôn mặt...');
      const descriptor = await getFaceDescriptor(videoRef.current);
      if (!descriptor) throw new Error('Không nhận diện được khuôn mặt.');

      // 1️⃣ Đăng ký tài khoản (bật xác nhận email)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: DEFAULT_PASSWORD,
      });
      if (signUpError && !/already registered/i.test(signUpError.message)) throw signUpError;

      const userId = signUpData?.user?.id || null;

      // 2️⃣ Ghi dữ liệu khuôn mặt (với hoặc không có user_id)
      const { data: existingFace } = await supabase.from('face_data').select('id').eq('email', email).maybeSingle();

      const faceRecord = {
        email,
        user_id: userId,
        descriptor: JSON.stringify(Array.from(descriptor)),
      };

      if (existingFace) {
        await supabase.from('face_data').update(faceRecord).eq('email', email);
      } else {
        await supabase.from('face_data').insert(faceRecord);
      }

      setStatus('✅ Đăng ký thành công! Hãy xác nhận email trước khi đăng nhập.');
    } catch (err) {
      console.error(err);
      setStatus('❌ Lỗi: ' + (err?.message || err));
    }
  };

  // 👁️ Đăng nhập bằng khuôn mặt
  const handleFaceLogin = async () => {
    try {
      setStatus('📸 Đang quét khuôn mặt...');
      const newDescriptor = await getFaceDescriptor(videoRef.current);
      if (!newDescriptor || newDescriptor.length === 0) throw new Error('Không phát hiện được khuôn mặt.');

      const { data: faceData, error } = await supabase.from('face_data').select('*');
      if (error) throw error;

      let matchedUser = null;
      for (const record of faceData || []) {
        try {
          const stored = new Float32Array(JSON.parse(record.descriptor));
          if (stored.length !== newDescriptor.length) continue;
          if (compareFaces(stored, newDescriptor)) {
            matchedUser = record;
            break;
          }
        } catch (e) {
          console.warn('Lỗi descriptor:', e);
        }
      }

      if (!matchedUser) {
        setStatus('❌ Không tìm thấy khuôn mặt trùng khớp.');
        return;
      }

      let { user_id: userId, email: userEmail } = matchedUser;

      // 🔄 Nếu chưa có user_id → truy ngược lại từ email
      if (!userId && userEmail) {
        const { data: userInfo } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', userEmail)
          .maybeSingle();

        if (userInfo?.id) {
          userId = userInfo.id;
          await supabase.from('face_data').update({ user_id: userId }).eq('email', userEmail);
        }
      }

      if (!userEmail) {
        setStatus('⚠️ Không tìm thấy email liên kết. Hãy đăng nhập bằng email lần đầu.');
        return;
      }

      setStatus('✅ Khuôn mặt trùng khớp, đang đăng nhập...');

      // 🔐 Đăng nhập Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: DEFAULT_PASSWORD,
      });
      if (signInError) throw signInError;

      // 🧩 Kiểm tra loại tài khoản
      const { data: typeData } = await supabase.from('user_types').select('type').eq('user_id', userId).maybeSingle();
      const type = typeData?.type || null;

      if (!type) {
        setFoundUserId(userId);
        setIsChoosingType(true);
      } else {
        await ensureProfileExists(userId, type, userEmail);
        router.push(`/profile/${type}`);
      }

      setStatus('✅ Đăng nhập Face ID thành công!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Lỗi: ' + (err?.message || err));
    }
  };

  // 👥 Chọn loại tài khoản
  const handleChooseType = async (type) => {
    if (!foundUserId) return;
    await supabase.from('user_types').upsert({ user_id: foundUserId, type });
    const { data: faceRecord } = await supabase
      .from('face_data')
      .select('email')
      .eq('user_id', foundUserId)
      .maybeSingle();
    const userEmail = faceRecord?.email || email;
    await ensureProfileExists(foundUserId, type, userEmail);
    router.push(`/profile/${type}`);
  };

  return (
    <>
      <Navbar />
      <motion.div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-6">
        <motion.div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-2">👁️ Đăng nhập / Đăng ký bằng Face ID</h1>
          <p className="text-sm text-gray-500 mb-4">{status}</p>

          <video ref={videoRef} autoPlay muted width="400" height="300" className="rounded-xl border mb-4 mx-auto" />

          <input
            type="email"
            placeholder="📧 Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded mb-3"
          />

          <div className="flex flex-col gap-3">
            <button onClick={handleRegister} disabled={!isModelLoaded} className="bg-blue-600 text-white py-3 rounded">
              🔐 Đăng ký
            </button>
            <button onClick={handleFaceLogin} disabled={!isModelLoaded} className="bg-green-600 text-white py-3 rounded">
              👁️ Đăng nhập bằng khuôn mặt
            </button>
          </div>
        </motion.div>

        {isChoosingType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-bold mb-2">Chọn loại tài khoản</h3>
              <div className="flex gap-3">
                <button onClick={() => handleChooseType('user')} className="px-4 py-2 bg-blue-600 text-white rounded">
                  User
                </button>
                <button onClick={() => handleChooseType('company')} className="px-4 py-2 bg-green-600 text-white rounded">
                  Company
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
