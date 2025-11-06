"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Building2, Search, Trash2, Edit } from "lucide-react";

// ⚡ Dynamic import tránh lỗi SSR
const JobMap = dynamic(() => import("../components/JobMap"), { ssr: false });

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  async function fetchJobs() {
    setLoading(true);
    let query = supabase
      .from("job_posts")
      .select("*, company_profiles(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) console.error("❌ Lỗi lấy danh sách công việc:", error);
    else {
      setJobs(data);
      setTotalJobs(count || 0);
    }
    setLoading(false);
  }

  async function handlePost(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("⚠️ Bạn chưa đăng nhập");

      const { data: company } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!company) return alert("⚠️ Không tìm thấy hồ sơ công ty");

      if (editingJobId) {
        const { error } = await supabase
          .from("job_posts")
          .update({ ...form, updated_at: new Date() })
          .eq("id", editingJobId);
        if (error) throw error;
        alert("✅ Bài tuyển dụng đã được cập nhật!");
        setEditingJobId(null);
      } else {
        const { error } = await supabase
          .from("job_posts")
          .insert([{ company_id: company.id, ...form, views: 0 }]);
        if (error) throw error;
        alert("✅ Đăng bài thành công!");
      }

      setForm({ title: "", description: "", location: "" });
      setPage(1);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi đăng bài: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(job) {
    setForm({ title: job.title, description: job.description, location: job.location });
    setEditingJobId(job.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(jobId) {
    if (!confirm("Bạn có chắc muốn xóa bài tuyển dụng này?")) return;
    const { error } = await supabase.from("job_posts").delete().eq("id", jobId);
    if (error) console.error(error);
    else {
      alert("✅ Xóa thành công!");
      fetchJobs();
    }
  }

  function totalPages() {
    return Math.ceil(totalJobs / PAGE_SIZE);
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent"
        >
          🌍 Việc Làm & Cơ Sở Hỗ Trợ Quanh Bạn
        </motion.h1>

        {/* FORM */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg border border-gray-200 p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <Briefcase /> {editingJobId ? "Chỉnh sửa bài tuyển dụng" : "Đăng bài tuyển dụng mới"}
          </h2>
          <form onSubmit={handlePost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tiêu đề công việc"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Địa điểm"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <textarea
              placeholder="Mô tả công việc"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none col-span-1 md:col-span-2 h-28"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={saving}
              className={`col-span-1 md:col-span-2 py-3 rounded-xl text-white font-semibold shadow-md transition-all ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
              }`}
            >
              {saving ? "💾 Đang lưu..." : editingJobId ? "💾 Cập nhật bài" : "🚀 Đăng bài"}
            </button>
          </form>
        </motion.section>

        {/* TÌM KIẾM */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc địa điểm..."
              className="w-full border rounded-lg py-2 pl-9 pr-3 focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setPage(1)}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
          >
            Tìm kiếm
          </button>
        </motion.div>

        {/* DANH SÁCH */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="space-y-5"
        >
          {loading ? (
            <div className="text-center text-gray-600 p-6">⏳ Đang tải danh sách việc làm...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-gray-600 p-6">Không tìm thấy bài tuyển dụng nào.</div>
          ) : (
            jobs.map((job) => (
              <motion.div
                key={job.id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg border border-gray-100 transition-all"
                whileHover={{ scale: 1.01 }}
              >
                <h3 className="text-xl font-bold text-blue-700">{job.title}</h3>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={16} /> {job.location || "Không rõ"}
                </p>
                <p className="mt-2 text-gray-700">{job.description}</p>
                <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                  <Building2 size={14} /> {job.company_profiles?.company_name || "Chưa rõ"} • 👁 {job.views || 0}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(job)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-semibold"
                  >
                    <Edit size={16} /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                  >
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.section>

        {/* PHÂN TRANG */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
          >
            ⬅️ Trước
          </button>
          <span className="font-semibold">
            Trang {page} / {totalPages()}
          </span>
          <button
            disabled={page >= totalPages()}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
          >
            Tiếp ➡️
          </button>
        </div>

        {/* BẢN ĐỒ */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="relative w-full h-[600px] rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <JobMap jobs={jobs} />
        </motion.div>
      </main>
    </motion.div>
  );
}
