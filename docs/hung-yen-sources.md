# Địa danh Hưng Yên cũ dùng cho bộ bài dịch vụ

Phạm vi là địa bàn **tỉnh Hưng Yên trước sáp nhập cấp tỉnh năm 2025**, không gồm tỉnh Thái Bình cũ. Dữ liệu nằm trong `data/hung-yen-localities.json`, đối chiếu ngày 29/10/2026.

## Các mốc dữ liệu

- **1/7/2025:** 39 đơn vị mới trên địa bàn Hưng Yên cũ, gồm 33 xã và 6 phường, lấy từ khoản 1–33 và 94–99 Điều 1 Nghị quyết 1666/NQ-UBTVQH15. Các khoản 34–93 và 100–104 thuộc địa bàn Thái Bình cũ được loại khỏi tập này.
- **Ngay trước 1/7/2025:** 139 xã, phường, thị trấn cũ được đối chiếu với các đơn vị tiếp nhận. Bao gồm 118 xã, 13 phường và 8 thị trấn.
- **Trước 1/12/2024:** bổ sung 32 tên đơn vị đã được thay thế trong Nghị quyết 1248/NQ-UBTVQH15. Các tên này là `legacyUnits`, không tính trùng vào 139 đơn vị nói trên.
- **Cấp huyện cũ:** 8 huyện, 1 thị xã và 1 thành phố. Đây là địa danh lịch sử dùng để xác định khu vực phục vụ, không mô tả là cấp hành chính còn hoạt động.

Tổng cộng **220 mục địa phương**: 39 mới + 139 cũ + 32 tên cũ bổ sung + 10 cấp huyện cũ. Bài cùng tên nhưng khác thời kỳ hoặc khác huyện phải có ID và đường dẫn riêng. Ví dụ, xã Hoàng Hoa Thám cũ thuộc Ân Thi khác xã Hoàng Hoa Thám hình thành năm 2025 ở khu vực Tiên Lữ.

## Nguồn chính thức

1. [Nghị quyết 1666/NQ-UBTVQH15 – Báo điện tử Chính phủ](https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-1666-nq-ubtvqh15-sap-xep-cac-dvhc-cap-xa-cua-tinh-hung-yen-nam-2025-119250616195158879.htm). Nguồn chính cho tên đơn vị mới, loại hình, danh sách đơn vị trước sắp xếp và trường hợp nhận một phần địa bàn.
2. [Nghị quyết 1248/NQ-UBTVQH15 – Công an tỉnh Hưng Yên](https://congan.hungyen.gov.vn/nghi-quyet-so-1248nq-ubtvqh-sap-xep-don-vi-hanh-chinh-tinh-hung-yen-c229518.html). Nguồn cho 32 tên cũ bổ sung và các bước chuyển tiếp có hiệu lực từ 1/12/2024.
3. [HĐND huyện Khoái Châu – phương án sắp xếp năm 2025](https://ddbqhhdnd.hungyen.gov.vn/hdnd-cap-huyen-xa/hdnd-huyen-khoai-chau-to-chuc-ky-hop-thu-17-khoa-xx.html). Đối chiếu xã Đông Tảo, Bình Minh thuộc Khoái Châu cũ và chuyển vào các xã mới có địa bàn liên quan Yên Mỹ, Văn Giang.
4. [Cổng xã Tân Hưng – nguồn gốc các xã trước sáp nhập](https://tanhung.hungyen.gov.vn/doan-cong-tac-uy-ban-kiem-tra-trung-uong-lam-viec-tai-xa-tan-hung-c25.html). Đối chiếu Phương Nam, Tân Hưng thuộc thành phố Hưng Yên cũ và Thủ Sỹ thuộc Tiên Lữ cũ.
5. [Công báo tỉnh – Nghị quyết HĐND về phương án sắp xếp](https://congbao-old.hungyen.gov.vn/congbao.nsf/324650F5F221159D47258C810027D4B7/%24file/NQ%20579.H%C4%90ND_signed.pdf). Đối chiếu xã Ngọc Thanh thuộc Kim Động cũ, có phần địa bàn vào phường Sơn Nam.

Các nguồn được dùng để xác định địa danh và quan hệ sắp xếp; không dùng để suy ra Infiniti Seller có văn phòng, nhân viên thường trực hoặc thời gian di chuyển cụ thể tại từng địa phương.

## Các trường hợp không thể ánh xạ một–một

- **Ngọc Thanh, Kim Động cũ:** một phần vào xã Hiệp Cường, phần còn lại vào phường Sơn Nam. Cả hai liên kết trong `newUnits.oldUnits` có `partial: true`.
- **Đình Dù, Văn Lâm cũ:** một phần vào xã Như Quỳnh, phần còn lại vào xã Đại Đồng. Cả hai liên kết có `partial: true`.
- **Lạc Đạo, Văn Lâm cũ:** một phần vào xã Lạc Đạo mới, phần còn lại vào xã Đại Đồng. Cả hai liên kết có `partial: true`.
- **Phương Chiểu trước 1/12/2024:** 0,05 km² được nhập vào Liên Phương; phần còn lại hợp với Hồng Nam thành Phương Nam. Vì vậy `legacyUnits` dẫn qua cả Liên Phương và Phương Nam, và có ghi chú riêng. Đến mốc 1/7/2025, hai hướng tiếp nhận lần lượt liên quan Phố Hiến và Tân Hưng.

Không diễn đạt một địa chỉ thôn cụ thể thuộc duy nhất một đơn vị mới nếu chỉ biết tên xã cũ bị chia một phần. Khi tiếp nhận yêu cầu dịch vụ, cần hỏi tên thôn/đường, vị trí hoặc tên xã/phường khách đang sử dụng.

## Kiểm tra tính đầy đủ

| Địa bàn cấp huyện cũ | Đơn vị trước 1/7/2025 |
| -------------------- | --------------------: |
| Thành phố Hưng Yên   |                    15 |
| Huyện Tiên Lữ        |                    11 |
| Huyện Phù Cừ         |                    13 |
| Huyện Kim Động       |                    15 |
| Huyện Ân Thi         |                    18 |
| Huyện Khoái Châu     |                    20 |
| Huyện Yên Mỹ         |                    12 |
| Huyện Văn Lâm        |                    11 |
| Huyện Văn Giang      |                    11 |
| Thị xã Mỹ Hào        |                    13 |
| **Tổng**             |               **139** |

ID của mỗi đơn vị cũ gồm loại hình, tên không dấu và ID cấp huyện cũ. Mỗi đơn vị mới có số khoản `clause` để đối chiếu trực tiếp Nghị quyết 1666. Các ID trong `viaOldUnitIds` của nhóm tên trước 1/12/2024 đều trỏ đến đơn vị cũ có thật trong tập 139.

## Giới hạn thời điểm

Loại hình xã/phường trong tập dữ liệu là **theo mốc sắp xếp 1/7/2025**. Không tự nâng xã thành phường từ một dự thảo, chủ trương hoặc đợt lấy ý kiến năm 2026. [Báo điện tử Chính phủ ngày 8/10/2026](https://baochinhphu.vn/nhan-dan-hung-yen-ung-ho-thanh-lap-cac-phuong-tren-dia-ban-tinh-102261008160556543.htm) vẫn mô tả việc lấy ý kiến đối với đề án thành lập phường. Tập này không khẳng định mọi loại hình hành chính giữ nguyên mãi sau mốc dữ liệu.
