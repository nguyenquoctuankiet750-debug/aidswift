'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax: ảnh nền di chuyển chậm hơn khi cuộn
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <section
      ref={ref}
      className="relative h-[400px] md:h-[500px] flex items-center justify-center text-center overflow-hidden bg-gradient-to-b from-blue-50 to-white"
    >
      {/* Ảnh nền Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0"
      >
        <Image
          src="/images/placeholder-banner.jpg"
          alt="Banner"
          fill
          priority
          className="object-cover brightness-[0.7]"
        />
      </motion.div>

      {/* Overlay màu xanh nhẹ */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/40 to-blue-900/70 backdrop-blur-[2px]" />

      {/* Nội dung Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true }}
        className="absolute z-10 text-white px-6"
      >
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg"
        >
          Hỗ trợ và Kết nối Việc làm Nhanh chóng
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
        >
          AidSwift — nền tảng hỗ trợ khẩn cấp và tìm việc linh hoạt, giúp các cộng đồng trở nên an toàn và bền vững hơn.
        </motion.p>

        {/* Nút hành động */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/sos"
            className="bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-pink-400 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            🚨 Gửi SOS
          </Link>
          <Link
            href="/jobs"
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            💼 Tìm Việc Làm
          </Link>
        </motion.div>
      </motion.div>

      {/* 🌊 Sóng SVG 3 lớp đẹp hơn */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="w-full h-28"
        >
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
  );
}
