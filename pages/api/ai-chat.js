// pages/api/ai-chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Phương thức không hợp lệ" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Thiếu prompt" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Thiếu GEMINI_API_KEY trong .env.local" });
    }

    const model = "gemini-1.5-flash"; // ✅ model ổn định và được hỗ trợ

    const systemPrompt = `
Bạn là một trợ lý AI thông minh, lịch sự và luôn trả lời bằng tiếng Việt.
Hãy trả lời chi tiết, dễ hiểu và chia thành từng phần rõ ràng nếu câu hỏi phức tạp.
Nếu được hỏi về lập trình, hãy dùng markdown để hiển thị code.
Nếu được hỏi về kiến thức, hãy giải thích logic từng bước.
Nếu không chắc chắn, hãy nêu rõ và gợi ý hướng tìm hiểu.
    `;

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
            maxOutputTokens: 1000,
            topP: 0.9,
          },
        }),
      }
    );

    const data = await response.json();

    // ✅ Log rõ lỗi để dễ phát hiện
    if (!response.ok) {
      console.error("❌ Gemini API Response Error:", data);
      return res.status(500).json({
        error: "Gemini API trả về lỗi.",
        details: data.error || data,
      });
    }

    // ✅ Kiểm tra phản hồi hợp lệ
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      return res.status(200).json({
        reply: "⚠️ Tôi không thể xử lý câu hỏi này. Hãy thử diễn đạt lại nhé!",
      });
    }

    // ✂️ Giới hạn độ dài phản hồi
    const limitedReply =
      reply.length > 3000
        ? reply.slice(0, 3000) + "\n\n⚠️ Phản hồi bị rút gọn vì quá dài."
        : reply;

    return res.status(200).json({ reply: limitedReply });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return res.status(500).json({
      error: "Lỗi server nội bộ",
      details: error.message,
    });
  }
}
