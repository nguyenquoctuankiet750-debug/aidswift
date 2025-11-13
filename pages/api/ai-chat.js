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

    // ⚙️ Nên dùng model ổn định hơn
    const model = "gemini-1.5-flash-latest";

    // 🧠 Hướng dẫn AI chi tiết
    const systemPrompt = `
      Bạn là một trợ lý AI thông minh, thân thiện và luôn trả lời bằng tiếng Việt.
      Hãy trả lời chi tiết, dễ hiểu và chia thành từng phần nếu câu hỏi phức tạp.
      Nếu được hỏi về lập trình, hãy trình bày bằng Markdown.
      Nếu không chắc chắn, hãy nói rõ và gợi ý cách tìm hiểu.
    `;

    // 🟢 Gửi đúng cấu trúc JSON mới của Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nNgười dùng hỏi: ${prompt}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1500,
            topP: 0.8,
          },
        }),
      }
    );

    const data = await response.json();

    // ❌ Nếu có lỗi từ API
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(500).json({
        error: "Gemini API lỗi",
        details: data,
      });
    }

    // ✅ Đọc phản hồi mới đúng cấu trúc
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Gemini không thể xử lý câu hỏi này. Hãy thử lại với cách khác.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ error: "Lỗi server nội bộ", details: error.message });
  }
}
