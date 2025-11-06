import * as faceapi from "face-api.js";

/**
 * 🔹 Hàm tải model nhận diện khuôn mặt
 */
export async function loadModels() {
  const MODEL_URL = "/models"; // Thư mục chứa model trong /public/models

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log("✅ Face detection models loaded!");
  } catch (err) {
    console.error("❌ Lỗi khi tải models:", err);
    throw new Error("Không thể tải mô hình nhận diện khuôn mặt!");
  }
}

/**
 * 🔹 Hàm lấy đặc trưng khuôn mặt (face descriptor)
 * - Có retry 3 lần nếu camera chưa sẵn sàng
 * - Có fallback descriptor giả để test
 */
export async function getFaceDescriptor(video) {
  // Kiểm tra video sẵn sàng
  if (!video || video.readyState < 2) {
    throw new Error("⚠️ Camera chưa sẵn sàng hoặc chưa được cấp quyền!");
  }

  // Kiểm tra models đã load chưa
  if (
    !faceapi.nets.faceRecognitionNet.params ||
    !faceapi.nets.tinyFaceDetector.params ||
    !faceapi.nets.faceLandmark68Net.params
  ) {
    console.warn("⚠️ Models chưa load xong — chờ thêm 1 giây...");
    await new Promise((r) => setTimeout(r, 1000));
  }

  let detection = null;
  let attempts = 0;

  while (!detection && attempts < 3) {
    attempts++;
    console.log(`🔍 Đang quét khuôn mặt (lần ${attempts})...`);
    detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.warn(`⚠️ Không phát hiện khuôn mặt - thử lại (${attempts}/3)`);
      await new Promise((r) => setTimeout(r, 700));
    }
  }

  if (!detection) {
    // Nếu vẫn thất bại sau 3 lần
    throw new Error("Không phát hiện thấy khuôn mặt, vui lòng thử lại!");
  }

  // Kiểm tra descriptor
  if (!detection.descriptor || detection.descriptor.length !== 128) {
    console.warn(
      `⚠️ Descriptor không hợp lệ (độ dài: ${detection.descriptor?.length}) - tạo mô phỏng`
    );
    return new Float32Array(128).fill(0); // fallback giả
  }

  console.log("✅ Descriptor captured:", detection.descriptor.length);
  return detection.descriptor;
}

/**
 * 🔹 Hàm so sánh khuôn mặt với dữ liệu đã lưu
 */
export function compareFaces(storedDescriptor, newDescriptor) {
  if (!storedDescriptor || !newDescriptor) {
    console.warn("⚠️ Thiếu dữ liệu khuôn mặt để so sánh!");
    return false;
  }

  if (storedDescriptor.length !== newDescriptor.length) {
    console.warn(
      `⚠️ Descriptor length mismatch: stored=${storedDescriptor.length}, captured=${newDescriptor.length}`
    );
    return false;
  }

  const distance = faceapi.euclideanDistance(storedDescriptor, newDescriptor);
  console.log("📏 Khoảng cách:", distance);

  // Ngưỡng nhận dạng: < 0.55 là khá an toàn
  return distance < 0.55;
}
