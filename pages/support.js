"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("grant");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("policies")
        .select(
          "id, title, category, description, details_link, policy_posts(title, content, author, link)"
        )
        .eq("category", activeTab);

      if (error) {
        console.error("Lỗi tải dữ liệu:", error);
        setPosts([]);
      } else {
        const merged = data.flatMap((p) =>
          p.policy_posts.map((post) => ({
            ...post,
            policyTitle: p.title,
            policyDesc: p.description,
          }))
        );
        setPosts(merged);
      }
      setLoading(false);
    };

    fetchPolicies();
  }, [activeTab]);

  const tabs = [
    { id: "grant", label: "💰 Trợ cấp" },
    { id: "edu", label: "🎓 Giáo dục" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Tiêu đề */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌍 Trung tâm Hỗ trợ Người Khuyết Tật
          </h1>
          <p className="text-gray-600 text-lg">
            Cập nhật các chính sách trợ cấp và giáo dục mới nhất từ chính phủ Việt Nam.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10 space-x-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full font-medium shadow transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border text-gray-700 hover:bg-blue-100"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Danh sách bài đăng */}
        {loading ? (
          <p className="text-gray-500 text-center animate-pulse">
            Đang tải dữ liệu...
          </p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có bài đăng nào.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {posts.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all"
                >
                  <h2
                    onClick={() =>
                      setExpanded(expanded === index ? null : index)
                    }
                    className="text-lg font-semibold text-gray-800 mb-1 cursor-pointer hover:text-blue-600 transition"
                  >
                    {item.title}
                  </h2>
                  <p className="text-gray-500 text-sm mb-2">{item.author}</p>

                  <AnimatePresence>
                    {expanded === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {item.content}
                        </p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          🔗 Xem nguồn chính thức
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
