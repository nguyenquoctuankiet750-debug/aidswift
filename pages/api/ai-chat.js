// pages/api/ai-chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Phương thức không hợp lệ" });
  }

  try {
    const { prompt } = req.body;

    // 🧩 Kiểm tra input
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Thiếu hoặc sai định dạng prompt" });
    }

    // 🔑 Lấy API key từ biến môi trường
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("❌ Thiếu GEMINI_API_KEY trong môi trường.");
      return res
        .status(500)
        .json({ error: "Thiếu GEMINI_API_KEY trong cấu hình server" });
    }

    // 🧠 Model bạn đang dùng
    const model = "gemini-1.5-flash";

    // 🧭 Prompt hệ thống (hướng dẫn AI)
    const systemPrompt = `
      Bạn là một trợ lý AI thông minh, lịch sự và luôn trả lời bằng tiếng Việt.
      Hãy giải thích chi tiết, dễ hiểu và chia thành các mục rõ ràng nếu cần.
      Nếu câu hỏi liên quan đến lập trình, hãy hiển thị code bằng markdown.
      Nếu không chắc chắn, hãy nói rõ và gợi ý hướng tìm hiểu tiếp theo.
    `;

    // 🚀 Gửi yêu cầu đến Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nCâu hỏi người dùng: ${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1200,
            topP: 0.8,
          },
        }),
      }
    );

    // 📦 Nhận kết quả JSON
    const data = await response.json();

    // ❗ Nếu Gemini trả lỗi HTTP
    if (!response.ok) {
      console.error("🚨 Gemini API lỗi:", data);
      return res.status(500).json({
        error: "Gemini API lỗi",
        details: data?.error?.message || "Không rõ nguyên nhân.",
      });
    }

    // 💬 Trích xuất phản hồi từ Gemini
    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "⚠️ Tôi không thể xử lý câu hỏi này. Vui lòng thử lại với cách diễn đạt khác.";

    // ✂️ Giới hạn phản hồi dài quá mức
    if (reply.length > 4000) {
      reply =
        reply.slice(0, 4000) + "\n\n⚠️ Phản hồi bị rút gọn vì quá dài.";
    }

    // ✅ Trả về phản hồi
    return res.status(200).json({ reply });
  } catch (error) {
    // 🔍 Ghi log chi tiết lỗi server (hiện trên terminal hoặc Vercel logs)
    console.error("🔥 Lỗi server chi tiết:", error);

    return res.status(500).json({
      error: "Lỗi server nội bộ",
      message: error.message,
      stack: error.stack,
    });
  }
}
