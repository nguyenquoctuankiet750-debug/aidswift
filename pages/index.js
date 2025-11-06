'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']); // Parallax nhẹ

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800 scroll-smooth">
      <Navbar />

      {/* 🔹 Banner Section (Hero lớn) */}
      <section
        ref={ref}
        className="relative h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden"
      >
        {/* Parallax Image */}
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src="/images/placeholder-banner.jpg"
            alt="AidSwift Banner"
            fill
            priority
            className="object-cover brightness-[0.8]"
          />
        </motion.div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/40 to-blue-900/70 backdrop-blur-[2px]" />

        {/* Nội dung */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute z-10 text-white px-6"
        >
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg"
          >
            Chào mừng đến với{' '}
            <span className="bg-gradient-to-r from-blue-300 to-cyan-400 text-transparent bg-clip-text">
              AidSwift
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
          >
            Nền tảng thông minh kết nối việc làm và hỗ trợ khẩn cấp -Vì một cộng đồng an toàn và phát triển hơn.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href="/login"
              className="bg-gradient-to-r from-red-500 to-pink-400 hover:from-red-400 hover:to-pink-300 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              Bắt đầu ngay
            </Link>
            <Link
              href="/jobs"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              Khám phá Cơ hội
            </Link>
          </motion.div>
        </motion.div>

        {/* 🌊 Sóng SVG 3 lớp (đồng bộ Hero.js) */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-28">
            <path
              d="M0,100 C150,200 350,0 600,100 C850,200 1050,0 1200,100 L1200,200 L0,200 Z"
              fill="url(#wave1)"
              opacity="0.5"
            />
            <path
              d="M0,120 C200,220 400,40 600,120 C800,200 1000,60 1200,120 L1200,200 L0,200 Z"
              fill="url(#wave2)"
              opacity="0.6"
            />
            <path
              d="M0,140 C250,240 450,60 600,140 C750,220 1000,80 1200,140 L1200,200 L0,200 Z"
              fill="url(#wave3)"
            />
            <defs>
              <linearGradient id="wave1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="wave2" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="wave3" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#BFDBFE" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* ⚡ Hero phụ (section tiếp theo) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Hero />
      </motion.div>

      {/* 💡 Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50" id="features">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            {
              title: 'Cảnh báo Khẩn cấp',
              desc: 'Phát hiện tín hiệu nguy hiểm và gửi cảnh báo SOS tức thời, bảo vệ bạn 24/7.',
              icon: '🚨',
            },
            {
              title: 'Kết nối Việc làm',
              desc: 'Tìm kiếm và đăng việc nhanh chóng, hỗ trợ cả ứng viên và doanh nghiệp.',
              icon: '💼',
            },
            {
              title: 'Hỗ trợ Cộng đồng',
              desc: 'Gắn kết những con người giúp nhau trong tình huống khẩn cấp và đời sống.',
              icon: '🤝',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.8 }}
              viewport={{ once: true }}
              className="p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-blue-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center"
            >
              <div className="text-6xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold text-blue-700 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✨ CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-20 text-center text-white overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500"
      >
        <div className="absolute inset-0 bg-[url('/images/bg-pattern.svg')] opacity-20" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
            Hãy sẵn sàng bắt đầu cùng AidSwift!
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Tham gia để cùng chúng tôi xây dựng một cộng đồng an toàn, mạnh mẽ và đoàn kết nhé.
          </p>
          <Link
            href="/login"
            className="bg-white text-blue-700 font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            Đăng ký ngay
          </Link>
        </div>
      </motion.section>

      {/* 🌍 Footer */}
      <footer className="bg-blue-950 text-blue-100 py-10 text-center">
        <p className="text-sm opacity-80">
          © {new Date().getFullYear()} <span className="font-semibold">AidSwift</span>. All rights reserved.
        </p>
        <p className="mt-2 text-xs text-blue-300">Được thiết kế & phát triển bởi nhóm KHKT 11/6 💙</p>
      </footer>
    </div>
  );
}
