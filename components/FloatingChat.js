"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Send, MessageCircle } from "lucide-react";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();

      let reply = data.reply || "⚠️ Tôi không thể xử lý câu hỏi này.";
      if (reply.length > 2000)
        reply = reply.slice(0, 2000) + "\n\n⚠️ (Phản hồi bị rút gọn vì quá dài)";

      const aiMessage = { role: "ai", text: reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Lỗi khi kết nối với Gemini API." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Tự cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Copy tin nhắn
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      {/* 🔹 Nút mở chat */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 z-50"
      >
        {open ? "✖" : <MessageCircle size={26} />}
      </button>

      {/* 🔹 Cửa sổ chat */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 sm:w-96 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden z-50 animate-fade-in">
          <div className="bg-blue-600 p-3 font-semibold text-center">🤖 Trợ lý AidSwift</div>

          <div className="h-96 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative group p-3 rounded-2xl text-sm shadow-md transition-all duration-300 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-right max-w-[75%]"
                      : "bg-gray-800 text-left max-w-[85%]"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>

                  {msg.role === "ai" && (
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="absolute top-1 right-2 text-gray-400 opacity-0 group-hover:opacity-100 text-xs transition hover:text-blue-400"
                    >
                      {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 text-sm animate-pulse">🤖 Đang soạn phản hồi...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <div className="flex p-2 border-t border-gray-800 bg-gray-850">
            <input
              className="flex-grow p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="ml-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-medium transition disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <Send size={16} />
              Gửi
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
