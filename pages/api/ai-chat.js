// pages/api/ai-chat.js
export default async function handler(req, res) {
  // ✅ Chỉ chấp nhận POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Phương thức không hợp lệ" });
  }

  try {
    const { prompt } = req.body;

    // ✅ Kiểm tra dữ liệu đầu vào
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Thiếu hoặc sai định dạng prompt" });
    }

    // ✅ Lấy GEMINI_API_KEY từ biến môi trường
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("❌ Thiếu GEMINI_API_KEY trong .env.local hoặc cấu hình Vercel");
      return res.status(500).json({
        error: "Thiếu GEMINI_API_KEY trong cấu hình server",
        message: "Vui lòng thêm GEMINI_API_KEY vào file .env.local hoặc phần Environment Variables trên Vercel.",
      });
    }

    // ✅ Model ổn định (được Google public)
    const model = "gemini-1.5-flash";

    // 🧠 System prompt (hướng dẫn AI)
    const systemPrompt = `
      Bạn là một trợ lý AI thân thiện, chuyên hỗ trợ người dùng bằng tiếng Việt.
      Hãy giải thích rõ ràng, chi tiết, có ví dụ cụ thể nếu được hỏi về kỹ thuật.
      Nếu không hiểu câu hỏi, hãy lịch sự yêu cầu người dùng làm rõ hơn.
      Nếu nói về code, hãy hiển thị trong markdown \`\`\`.
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
            topP: 0.9,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    const data = await response.json();

    // ❗ Nếu Gemini API lỗi → gửi chi tiết lỗi về frontend
    if (!response.ok) {
      console.error("🚨 Gemini API lỗi:", data);
      return res.status(500).json({
        error: "Gemini API lỗi",
        message: data?.error?.message || "Không rõ nguyên nhân",
        details: data,
      });
    }

    // 💬 Lấy phản hồi từ Gemini
    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!reply.trim()) {
      reply = "⚠️ Tôi không thể xử lý câu hỏi này. Vui lòng thử lại sau hoặc diễn đạt khác.";
    }

    // ✂️ Giới hạn độ dài phản hồi
    if (reply.length > 3000) {
      reply = reply.slice(0, 3000) + "\n\n⚠️ Phản hồi bị rút gọn vì quá dài.";
    }

    // ✅ Trả kết quả về client
    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("🔥 Lỗi server:", error);

    // 🧩 Gửi chi tiết lỗi về frontend
    res.status(500).json({
      success: false,
      error: "Lỗi server nội bộ",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
