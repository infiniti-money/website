# Ảnh bài viết dịch vụ theo từ khóa

Các bài địa phương có URL ảnh bìa riêng ở `/api/article-cover`. Khi được cấp `PEXELS_API_KEY` tại runtime, endpoint tìm ảnh Pexels theo nhóm từ khóa:
- máy tính → `computer repair technician`
- laptop → `laptop computer repair`
- máy in → `printer office repair`
- camera → `cctv security camera installation`
- Wi-Fi → `wifi router network installation`

Kết quả ảnh được chọn ổn định từ mã địa phương và được chuyển hướng đến ảnh Pexels. Khi API không có khóa, hết hạn mức, không tìm được ảnh hoặc lỗi mạng, endpoint hiển thị ảnh minh họa SVG hiện có. Ảnh Pexels là hình minh họa ngành nghề, **không phải ảnh chụp tại địa phương** và không được gắn nhãn như ảnh công trình đã thực hiện.

## Kích hoạt

1. Đăng ký và lấy Pexels API Key tại https://www.pexels.com/api/.
2. Điền `PEXELS_API_KEY` vào `.dev.vars` để kiểm thử nội bộ; với môi trường production, đặt dưới dạng secret, không commit vào GitHub.
3. Kiểm tra bằng cách mở URL `/api/article-cover?key=moi-example&place=Hung%20Yen&focus=laptop`. URL `&illustration=1` cho phép xem ảnh SVG dự phòng.
4. Kiểm tra chất lượng, tính liên quan, tỷ lệ khung, tình trạng thương hiệu/con người và quyền hình ảnh trước khi xuất bản. Nếu muốn biên tập riêng từng ảnh, cập nhật `cover_image` qua CMS.

Pexels cho phép sử dụng thương mại theo giấy phép của họ nhưng không tự động cấp quyền sử dụng nhãn hiệu, gương mặt hoặc tài sản xuất hiện trong ảnh. Không gợi ý Pexels hay nhiếp ảnh gia là đối tác/đại diện Infiniti Seller. API có giới hạn yêu cầu, nên cần kiểm tra quota và giải pháp lưu ảnh R2 trước khi triển khai lưu lượng lớn.

Nguồn: https://www.pexels.com/license/ và https://www.pexels.com/api/documentation/
