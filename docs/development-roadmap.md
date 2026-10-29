# Lộ trình phát triển Infiniti Seller

Cập nhật: 29/10/2026. Tài liệu này mô tả các hạng mục còn phải triển khai; không có mục nào được coi là hoàn thành nếu chưa có kiểm thử và bằng chứng trên Pull Request.

## 01. Ổn định hệ thống — ưu tiên P0

- [x] Có kịch bản kiểm thử cục bộ: `scripts/verify-commerce.mjs`, `scripts/verify-content-wallets.mjs`, `scripts/verify-service-article.mjs`, `scripts/verify-regional-seo.mjs`.
- [x] Khai báo lệnh npm/pnpm để chạy bộ kiểm thử hiện có.
- [ ] CI: xác nhận `pnpm install --frozen-lockfile`, `pnpm check:types` và `pnpm build` thành công trên GitHub Actions.
- [ ] Khởi động preview cùng cơ sở dữ liệu D1 riêng của mỗi job; chạy tuần tự các script tích hợp, bảo đảm dọn dữ liệu kiểm thử.
- [ ] Giỏ hàng: số lượng, giá từ máy chủ, phí giao hàng, đơn COD, xử lý lỗi.
- [ ] Tồn kho: tranh chấp đồng thời, giới hạn số lượng, hoàn kho khi hủy, idempotency.
- [ ] Thanh toán: webhook payOS đã xác thực chữ ký và số tiền, thử nghiệm sandbox, link ví đối soát thủ công, không xác nhận tiền chỉ vì khách quay về trang thanh toán.
- [ ] Bảo mật: quản trị, CSRF/origin, upload, giới hạn tần suất, không lộ secrets, nhật ký lỗi.
- [ ] Xác nhận quy trình backup/restore D1 và R2 và thử khôi phục.
- [ ] Không bật thanh toán thật trước khi xác minh tên miền công khai, khóa môi trường, webhook và cơ chế đơn quá hạn.

**Hoàn thành khi:** pipeline xanh; kiểm thử hành vi cốt lõi có kết quả ghi nhận; không có lỗi chặn đơn hàng/bảo mật P0.

## 02. Hoàn thiện giao diện — ưu tiên P1

- [ ] Trang chủ: đầu trang rõ lợi ích, danh mục trọng tâm, sản phẩm nổi bật, dịch vụ kỹ thuật, lời kêu gọi hành động.
- [ ] Danh mục/tìm kiếm: lọc giá, danh mục, tồn kho; sắp xếp; giữ bộ lọc trong URL; trạng thái không kết quả.
- [ ] Chi tiết sản phẩm: ảnh tối ưu, lựa chọn số lượng, thông tin tồn kho, thông số và chính sách mua hàng minh bạch.
- [ ] Mobile: menu, tìm kiếm, giỏ hàng và checkout thao tác bằng một tay, mục tiêu cảm ứng đủ lớn, không tràn ngang.
- [ ] Accessibility: keyboard, focus, nhãn input, alt ảnh, tương phản, trạng thái tải/lỗi.
- [ ] Hiệu năng: ảnh WebP/AVIF khi phù hợp, lazy loading, đo Lighthouse và Core Web Vitals trên thiết bị thực.
- [ ] Kiểm tra giao diện trên iOS Safari, Android Chrome và desktop.

**Hoàn thành khi:** hành trình tìm sản phẩm → giỏ hàng → đặt hàng và đặt lịch kỹ thuật rõ ràng trên mobile/desktop, không lỗi chức năng quan trọng.

## 03. Nâng cấp quản trị — ưu tiên P1

- [ ] Dashboard: doanh thu đã đối soát, số đơn, đơn chờ xử lý, lịch kỹ thuật, sản phẩm sắp hết hàng.
- [ ] Thống kê: lọc theo ngày/tuần/tháng, so sánh kỳ trước, biểu đồ xu hướng, mặt hàng bán chạy.
- [ ] Báo cáo: xuất CSV an toàn theo quyền quản trị, dữ liệu theo khoảng thời gian và trạng thái đơn.
- [ ] Tồn kho: tìm kiếm, lọc hàng ít tồn, cảnh báo theo ngưỡng, lịch sử điều chỉnh và lý do.
- [ ] Định nghĩa doanh thu: chỉ tính đơn đã xác nhận thanh toán; tránh tính trùng webhook/giao dịch; hoàn tiền điều chỉnh báo cáo.
- [ ] Phân quyền: tất cả truy vấn thống kê và thao tác kho phải được xác thực phía máy chủ.
- [ ] Chất lượng dữ liệu: timezone Asia/Ho_Chi_Minh hiển thị báo cáo và ranh giới ngày được quy định tường minh.

**Hoàn thành khi:** số liệu đối chiếu đúng với đơn hàng và giao dịch thật; không rò rỉ dữ liệu khách hàng giữa người dùng.

## Quy tắc triển khai

1. Thực hiện trên nhánh riêng, mở PR; giữ `main` ổn định.
2. Chạy kiểm tra kiểu, build và các bài kiểm thử phù hợp trước khi merge.
3. Không dùng dữ liệu khách hàng, token thanh toán hay khóa production trong CI.
4. Đánh dấu hoàn thành theo chứng cứ CI, màn hình kiểm thử và commit, không theo tiến độ ước lượng.
