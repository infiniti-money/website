// Stable copy variants: repeatable across builds, without random changes to SEO.
export function serviceHash(key: string): number {
  let value = 2166136261;
  for (const c of key) value = Math.imul(value ^ c.charCodeAt(0), 16777619);
  return value >>> 0;
}
const intros = [
  "Trước khi sửa chữa, hãy gửi model thiết bị và mô tả lỗi để được tư vấn phương án phù hợp.",
  "Với lỗi phát sinh đột ngột, bạn có thể gửi ảnh hoặc video để kỹ thuật viên khoanh vùng nguyên nhân ban đầu.",
  "Cửa hàng tiếp nhận thông tin lỗi thiết bị, tư vấn kiểm tra và xác nhận lịch theo địa chỉ khách cung cấp.",
  "Mỗi thiết bị có cấu hình khác nhau; việc sửa chữa cần được báo giá sau khi xác định tình trạng thực tế.",
  "Nếu máy đang chứa dữ liệu quan trọng, hãy nói rõ nhu cầu sao lưu trước khi đồng ý can thiệp.",
  "Khi liên hệ, khách nên cho biết thời điểm xuất hiện lỗi, thiết bị đi kèm và mục tiêu sử dụng.",
  "Để tránh thay thế không cần thiết, các bước kiểm tra được trao đổi trước khi xử lý.",
  "Các nhu cầu tại nhà và cơ sở kinh doanh được tiếp nhận theo lịch hẹn, tùy tình trạng thiết bị.",
];
const pc = [
  "PC không khởi động cần phân biệt lỗi cấp nguồn, bộ nhớ, màn hình và hệ điều hành trước khi đề xuất thay thế.",
  "Máy tính chạy chậm nên kiểm tra dung lượng SSD, ứng dụng khởi động cùng hệ thống và tình trạng RAM.",
  "Với máy tự tắt hoặc quá nóng, cần kiểm tra quạt, bụi bẩn và luồng gió trước khi kết luận lỗi linh kiện.",
  "Lỗi màn hình xanh cần ghi lại mã lỗi, thời điểm xảy ra và các thay đổi phần mềm gần đây.",
  "Máy không nhận thiết bị ngoại vi có thể liên quan cổng kết nối, driver hoặc thiết bị dùng chung.",
  "Nâng cấp máy bàn cần đối chiếu thông số bo mạch, RAM và chuẩn ổ lưu trữ để tránh mua sai linh kiện.",
];
const laptop = [
  "Laptop sạc chập chờn cần kiểm tra củ sạc, dây, chân cắm và trạng thái pin theo từng model.",
  "Bàn phím liệt phím hoặc touchpad lỗi cần phân biệt lỗi phần mềm và phần cứng trước khi tháo máy.",
  "Màn hình laptop nhấp nháy nên được kiểm tra cùng cáp tín hiệu, nguồn sáng và chế độ hiển thị.",
  "Laptop nóng khi làm việc cần kiểm tra tải ứng dụng và hệ thống tản nhiệt; không tự ý tháo máy còn bảo hành.",
  "Trước khi nâng cấp SSD, cần xác định chuẩn kết nối và phương án giữ dữ liệu từ ổ cũ.",
  "Wi-Fi laptop yếu nên thử đối chiếu với điện thoại ở cùng vị trí trước khi thay card mạng.",
];
const printer = [
  "Máy in kẹt giấy liên tục cần kiểm tra khay, con lăn và loại giấy đang sử dụng.",
  "Bản in mờ hoặc lem nên được đối chiếu với tình trạng hộp mực, trống và loại máy.",
  "Máy in không nhận lệnh qua mạng cần kiểm tra địa chỉ IP, hàng đợi in và kết nối LAN/Wi-Fi.",
  "Khi in được từ một máy nhưng lỗi ở máy khác, nên rà soát chia sẻ và driver trước khi sửa phần cứng.",
  "Máy in kéo nhiều tờ cần xác định tình trạng cụm kéo giấy và vệ sinh đúng vị trí.",
  "Nạp mực hay thay vật tư phải xác nhận model để tránh dùng linh kiện không tương thích.",
];
const camera = [
  "Camera mất hình cần kiểm tra nguồn cấp, đường truyền và trạng thái đầu ghi trước khi đổi thiết bị.",
  "Khu vực ngoài trời cần chọn camera và vật tư phù hợp môi trường lắp đặt, tránh hứa hẹn độ bền khi chưa khảo sát.",
  "Khi không xem được camera từ điện thoại, nên kiểm tra mạng và quyền truy cập trước khi cài lại hệ thống.",
  "Số ngày lưu hình phụ thuộc dung lượng, số mắt và cấu hình ghi; cần tính theo nhu cầu thực tế.",
  "Vị trí camera phải tính đến góc nhìn, nguồn điện và quyền riêng tư của người xung quanh.",
  "Khi bàn giao camera, khách cần kiểm tra tài khoản quản trị, xem trực tiếp và khả năng xem lại.",
];
const wifi = [
  "Wi-Fi yếu ở phòng xa có thể do vật cản, vị trí router hoặc nhiễu sóng; cần khảo sát trước khi thêm thiết bị.",
  "Với nhà nhiều tầng, nên cân nhắc điểm phát nối dây hoặc Mesh tùy đường mạng có sẵn.",
  "Máy in mạng và camera cần cấu hình địa chỉ phù hợp để hạn chế lỗi mất kết nối sau khi khởi động lại.",
  "Mạng chập chờn nên được phân biệt giữa lỗi đường truyền nhà cung cấp và hệ thống nội bộ.",
  "Thi công dây LAN cần chú ý vị trí đi dây, chuẩn đầu nối và kiểm tra tốc độ sau hoàn thiện.",
  "Thiết bị làm việc từ xa cần Wi-Fi ổn định; phương án phù hợp phụ thuộc mặt bằng và số người sử dụng.",
];
function select(items: string[], hash: number, offset: number): string {
  return items[(hash + offset) % items.length];
}
export function serviceVariation(key: string, place: string, context: string) {
  const h = serviceHash(key);
  const focus = ["máy tính", "laptop", "máy in", "camera", "Wi-Fi"][h % 5];
  return {
    focus,
    intro: `Tại ${place}, ${context}. ${select(intros,h,1)}`,
    pc: select(pc,h,2), laptop: select(laptop,h,3),
    printer: select(printer,h,4), camera: select(camera,h,5),
    wifi: select(wifi,h,6),
    // A distinct illustration URL per article; generated locally, no external image copyright risk.
    image: `/api/article-cover?key=${encodeURIComponent(key)}&place=${encodeURIComponent(place)}&focus=${encodeURIComponent(focus)}`,
  };
}
