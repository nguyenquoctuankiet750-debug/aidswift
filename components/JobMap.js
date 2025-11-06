"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder";
import "leaflet-routing-machine";

// 🧭 Cấu hình icon mặc định cho marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export default function JobMap() {
  useEffect(() => {
    const map = L.map("jobMap", { zoomControl: false }).setView([16.0471, 108.2068], 13);

    // 🗺️ Lớp bản đồ nền
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // 💼 DANH SÁCH VIỆC LÀM
    const jobs = [
      { title: "💼 Cửa hàng tạp hóa Minh Anh", desc: "Tuyển nhân viên khiếm thính, sắp xếp hàng hóa.", coords: [16.061, 108.223], color: "green" },
      { title: "🪵 Xưởng mộc Thiện Tâm", desc: "Tuyển lao động khuyết tật nhẹ, đào tạo nghề miễn phí.", coords: [16.048, 108.196], color: "green" },
      { title: "🍜 Quán ăn Yên Bình", desc: "Phục vụ bán thời gian, ưu tiên người khuyết tật tay/chân.", coords: [16.070, 108.220], color: "green" },
      { title: "🧵 Cơ sở may Hoàng Lan", desc: "Tuyển thợ may khiếm thính, có hỗ trợ ăn trưa.", coords: [16.051, 108.208], color: "green" },
      { title: "☕ Quán cà phê Hy Vọng", desc: "Tuyển phục vụ khiếm thính, môi trường thân thiện.", coords: [16.060, 108.215], color: "green" },
      { title: "🧹 Khách sạn Biển Xanh", desc: "Tuyển nhân viên vệ sinh, ưu tiên người khuyết tật nhẹ.", coords: [16.084, 108.245], color: "green" },
      { title: "🧑‍🏭 Xưởng cơ khí Bình Minh", desc: "Tuyển công nhân khuyết tật tay, hỗ trợ nghề nghiệp.", coords: [16.057, 108.185], color: "green" },
      { title: "🏢 Công ty CP Dệt May 29/3", desc: "Tuyển thợ may khiếm thính, đãi ngộ tốt.", coords: [16.047, 108.205], color: "green" },
      { title: "🏭 Cơ sở gỗ Phúc Lợi", desc: "Nhận người khuyết tật học nghề, có lương hỗ trợ.", coords: [16.065, 108.195], color: "green" },
      { title: "☕ Quán cà phê Nắng Mới", desc: "Tuyển phục vụ khiếm thính, ca linh hoạt.", coords: [16.075, 108.240], color: "green" },
      { title: "👕 Xưởng may Hòa Khánh", desc: "Tuyển thợ may khuyết tật nhẹ, làm việc ổn định.", coords: [16.072, 108.158], color: "green" },
      { title: "🏪 Siêu thị mini Tâm Đức", desc: "Tuyển nhân viên xếp hàng, ưu tiên người khiếm thị nhẹ.", coords: [16.078, 108.232], color: "green" },
      { title: "🧼 Nhà hàng Biển Đông", desc: "Tuyển nhân viên bếp, môi trường hòa nhập.", coords: [16.087, 108.244], color: "green" },
      { title: "🧺 Cơ sở giặt ủi An Tâm", desc: "Tuyển nhân viên khiếm thính, đào tạo miễn phí.", coords: [16.067, 108.210], color: "green" },
      { title: "🏘️ Hợp tác xã Hoa Sen", desc: "Nhận người khuyết tật sản xuất hàng thủ công mỹ nghệ.", coords: [16.058, 108.190], color: "green" },
      { title: "📦 Kho hàng Kim Ngân", desc: "Tuyển nhân viên đóng gói, có chỗ ăn ở.", coords: [16.064, 108.225], color: "green" },
      { title: "🍰 Tiệm bánh Nhân Ái", desc: "Tuyển người khuyết tật học nghề làm bánh miễn phí.", coords: [16.049, 108.214], color: "green" },
      { title: "🏠 Cơ sở từ thiện Hướng Dương", desc: "Dạy nghề cho người khiếm khuyết, có hỗ trợ chi phí.", coords: [16.052, 108.185], color: "green" },
      { title: "🎨 Cửa hàng tranh cát Đà Nẵng", desc: "Tuyển nhân viên làm thủ công, phù hợp người khuyết tật tay.", coords: [16.074, 108.220], color: "green" },
      { title: "🧶 Xưởng đan len Phúc An", desc: "Tuyển người khiếm thính, làm việc tại nhà.", coords: [16.069, 108.201], color: "green" },
      { title: "📚 Nhà sách Hy Vọng", desc: "Tuyển nhân viên thu ngân khiếm thính, làm theo ca.", coords: [16.063, 108.218], color: "green" },
      { title: "🧩 Trung tâm Việc làm Người Khuyết Tật Đà Nẵng", desc: "Cung cấp việc làm và đào tạo nghề.", coords: [16.064, 108.210], color: "green" },
    ];

    // 🏥 DANH SÁCH CƠ SỞ Y TẾ
    const hospitals = [
      { title: "🏥 Bệnh viện Đà Nẵng", coords: [16.071, 108.224] },
      { title: "🏥 Bệnh viện C Đà Nẵng", coords: [16.064, 108.211] },
      { title: "🏥 Bệnh viện Phụ sản – Nhi", coords: [16.072, 108.224] },
      { title: "🏥 Bệnh viện Mắt Đà Nẵng", coords: [16.062, 108.227] },
      { title: "🏥 Bệnh viện Chỉnh hình & PHCN", coords: [16.058, 108.195] },
      { title: "🏥 Trung tâm Y tế Hải Châu", coords: [16.061, 108.210] },
      { title: "🏥 Trung tâm Y tế Thanh Khê", coords: [16.068, 108.190] },
      { title: "🏥 Trung tâm Y tế Sơn Trà", coords: [16.096, 108.247] },
      { title: "🏥 Trung tâm Y tế Liên Chiểu", coords: [16.070, 108.155] },
      { title: "🏥 Phòng khám phục hồi chức năng Hoàng Diệu", coords: [16.054, 108.210] },
      { title: "🩺 Phòng khám Đa khoa Hòa Cường", coords: [16.047, 108.217] },
      { title: "🩺 Phòng khám An Bình", coords: [16.075, 108.220] },
      { title: "🩹 Trung tâm PHCN Hy Vọng", coords: [16.044, 108.200] },
    ];

    let userLocation = null;

    // 🚗 Hệ thống chỉ đường
    const routingControl = L.Routing.control({
      waypoints: [],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      lineOptions: { styles: [{ color: "#1E90FF", weight: 5 }] },
      show: false,
    }).addTo(map);

    // 📍 Việc làm markers
    jobs.forEach((job) => {
      const marker = L.circleMarker(job.coords, {
        radius: 9,
        fillColor: job.color,
        color: "#0b5345",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-size:15px;">
          <b>${job.title}</b><br>${job.desc}<br>
          <button id="route-job-${job.title}" style="margin-top:6px;background:#007bff;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;">📍 Chỉ đường</button>
        </div>`
      );

      marker.on("popupopen", () => {
        const btn = document.getElementById(`route-job-${job.title}`);
        if (btn) {
          btn.onclick = () => {
            if (userLocation) {
              routingControl.setWaypoints([
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(job.coords[0], job.coords[1]),
              ]);
            } else alert("⚠️ Không thể lấy vị trí hiện tại của bạn!");
          };
        }
      });
    });

    // 🏥 Cơ sở y tế markers (thêm chỉ đường)
    hospitals.forEach((h) => {
      const marker = L.circleMarker(h.coords, {
        radius: 8,
        fillColor: "#2980B9",
        color: "#1A5276",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-size:15px;">
          <b>${h.title}</b><br>Cơ sở y tế hỗ trợ phục hồi chức năng.<br>
          <button id="route-hos-${h.title}" style="margin-top:6px;background:#28a745;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;">📍 Chỉ đường</button>
        </div>`
      );

      marker.on("popupopen", () => {
        const btn = document.getElementById(`route-hos-${h.title}`);
        if (btn) {
          btn.onclick = () => {
            if (userLocation) {
              routingControl.setWaypoints([
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(h.coords[0], h.coords[1]),
              ]);
            } else alert("⚠️ Không thể lấy vị trí hiện tại của bạn!");
          };
        }
      });
    });

    // 🔍 Tìm kiếm địa điểm
    L.Control.geocoder({
      defaultMarkGeocode: true,
      placeholder: "🔎 Tìm kiếm địa điểm...",
    }).addTo(map);

    // 🧍‍♂️ Lấy vị trí hiện tại
    map.locate({ setView: true, maxZoom: 15 });
    map.on("locationfound", (e) => {
      userLocation = e.latlng;
      L.marker(userLocation).addTo(map).bindPopup("📍 Bạn đang ở đây").openPopup();
    });

    map.on("locationerror", () => console.warn("Không thể xác định vị trí."));

    // Nút zoom
    L.control.zoom({ position: "topright" }).addTo(map);

    // Fix lỗi lệch map
    setTimeout(() => map.invalidateSize(), 500);
    const fix = () => map.invalidateSize();
    window.addEventListener("scroll", fix);
    window.addEventListener("resize", fix);

    return () => {
      window.removeEventListener("scroll", fix);
      window.removeEventListener("resize", fix);
      map.remove();
    };
  }, []);

  return (
    <div
      id="jobMap"
      className="w-full h-[600px] rounded-xl shadow-lg border border-gray-200 relative z-0"
    ></div>
  );
}
