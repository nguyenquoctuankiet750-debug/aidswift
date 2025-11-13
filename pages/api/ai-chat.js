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

    // ✅ Lấy GEMINI_API_KEY từ môi trường
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("❌ Thiếu GEMINI_API_KEY trong .env.local hoặc cấu hình Vercel");
      return res
        .status(500)
        .json({ error: "Thiếu GEMINI_API_KEY trong cấu hình server" });
    }

    // ✅ Model ổn định, công khai
    const model = "gemini-1.5-flash";

    // 🧠 System prompt (để AI hiểu cách trả lời)
    const systemPrompt = `
      Bạn là một trợ lý AI thông minh, lịch sự và luôn trả lời bằng tiếng Việt.
      Hãy trả lời chi tiết, dễ hiểu và chia thành từng phần rõ ràng nếu câu hỏi phức tạp.
      Nếu được hỏi về lập trình, hãy dùng markdown để hiển thị code.
      Nếu được hỏi về kiến thức, hãy giải thích logic từng bước.
      Nếu không chắc chắn, hãy nêu rõ và gợi ý hướng tìm hiểu.
    `;

    // 🚀 Gửi request đến Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\nCâu hỏi người dùng: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            maxOutputTokens: 1200,
          },
        }),
      }
    );

    // 📦 Parse dữ liệu phản hồi
    const data = await response.json();

    // ❗ Xử lý nếu API lỗi
    if (!response.ok) {
      console.error("🚨 Gemini API lỗi:", data);
      return res.status(500).json({
        error: "Gemini API lỗi",
        message: data?.error?.message || "Không rõ nguyên nhân",
        details: data,
      });
    }

    // 💬 Lấy phản hồi từ Gemini
    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Tôi không thể xử lý câu hỏi này. Vui lòng thử lại.";

    // ✂️ Giới hạn độ dài phản hồi
    if (reply.length > 3000) {
      reply = reply.slice(0, 3000) + "\n\n⚠️ Phản hồi bị rút gọn vì quá dài.";
    }

    // ✅ Trả kết quả về client
    res.status(200).json({ reply });
  } catch (error) {
    console.error("🔥 Lỗi server nội bộ:", error);
    res.status(500).json({
      error: "Lỗi server nội bộ",
      message: error.message,
      stack: error.stack,
    });
  }
}
