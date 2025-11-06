'use client';
import Navbar from '../components/Navbar';
import GestureControl from '../components/GestureControl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

// Hiệu ứng mượt toàn trang
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function SosPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Hàm gửi vị trí GPS lên Supabase
  async function sendLocationSOS() {
    try {
      setSending(true);

      if (!navigator.geolocation) {
        alert("Thiết bị của bạn không hỗ trợ định vị GPS!");
        setSending(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          const { data: user } = await supabase.auth.getUser();

          const { error } = await supabase.from("sos_reports").insert([
            {
              user_id: user?.user?.email || "unknown",
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
              status: "active",
            },
          ]);

          if (error) {
            console.error(error);
            alert("❌ Lỗi khi gửi vị trí SOS!");
          } else {
            alert("✅ Đã gửi vị trí SOS thành công!");
            setSent(true);
          }
          setSending(false);
        },
        (err) => {
          console.error(err);
          alert("Không thể lấy vị trí! Hãy bật GPS và thử lại.");
          setSending(false);
        }
      );
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi gửi tín hiệu SOS!");
      setSending(false);
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white text-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center justify-center">
        {/* Tiêu đề chính */}
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-5xl font-extrabold text-center text-blue-700 mb-4"
        >
          🚨 GỬI TÍN HIỆU KHẨN CẤP
        </motion.h1>

        {/* Mô tả */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          className="text-center text-gray-700 text-lg mb-10 max-w-2xl leading-relaxed"
        >
          Giơ bàn tay theo <span className="font-semibold text-blue-700">cử chỉ SOS</span> để gửi tín hiệu khẩn cấp.
          <br />
          Hoặc nhấn nút dưới đây để gửi vị trí trực tiếp đến trung tâm cứu hộ.
        </motion.p>

        {/* Khung nhận diện cử chỉ */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 backdrop-blur-lg"
        >
          <h2 className="text-2xl font-semibold text-blue-800 text-center mb-4">
            ✋ Nhận diện cử chỉ SOS
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Hãy chắc chắn rằng tay bạn nằm trong khung camera để hệ thống nhận diện chính xác nhất.
          </p>

          {/* Giao diện chính của Gesture Control */}
          <div className="flex justify-center items-center bg-gray-50 rounded-xl border border-gray-200 shadow-inner p-4">
            <GestureControl />
          </div>

          {/* Nút gửi vị trí trực tiếp */}
          <div className="text-center mt-8">
            <button
              onClick={sendLocationSOS}
              disabled={sending || sent}
              className={`px-8 py-4 rounded-full font-semibold text-lg text-white shadow-md transition-all duration-300 ${
                sent
                  ? 'bg-gray-400 cursor-not-allowed'
                  : sending
                  ? 'bg-blue-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {sending ? "Đang gửi vị trí..." : sent ? "ĐÃ GỬI VỊ TRÍ SOS" : "📍 GỬI VỊ TRÍ TRỰC TIẾP"}
            </button>
          </div>

          {/* Hướng dẫn nhanh */}
          <div className="mt-8 text-center text-gray-700">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Giơ bàn tay và nắm lại theo nhịp để phát tín hiệu SOS.</li>
              <li>• Hoặc nhấn “Gửi vị trí trực tiếp” để báo vị trí hiện tại.</li>
              <li>• SOS sẽ gửi định kỳ nếu chưa nhận được phản hồi.</li>
            </ul>
          </div>
        </motion.div>

        {/* Mẹo an toàn */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
          className="mt-12 bg-white p-6 rounded-2xl shadow-md text-center border border-blue-100"
        >
          <h2 className="text-2xl font-semibold text-blue-800 mb-3">
            💡 Mẹo an toàn
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Nếu không thể sử dụng cử chỉ, hãy gọi đường dây nóng <span className="font-bold text-red-600">113 / 115</span> 
            hoặc nhấn nút gửi vị trí để được hỗ trợ nhanh nhất.
          </p>
        </motion.section>
      </main>
    </motion.div>
  );
}
