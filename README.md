# Infiniti Seller

Website bán laptop, máy tính, camera, máy in và phụ kiện; nhận lịch sửa chữa tại nhà, lắp đặt mạng và camera.

## Công nghệ

- React 19, TypeScript và cấu trúc Next.js App Router.
- Vinext biên dịch ứng dụng App Router để chạy trên Cloudflare Workers / Sites. Đây là runtime tương thích Next.js của starter Sites, không phải `next start` trên Node.
- Tailwind CSS 4, Framer Motion, Lucide và Zustand persist.
- D1 lưu sản phẩm, tồn kho, đơn hàng, lịch kỹ thuật và cấu hình; R2 lưu ảnh.
- React Dropzone nhận tới 300 ảnh/lượt. Hàng đợi xử lý 3 ảnh đồng thời, đổi WebP và giới hạn cạnh dài 1.800px trước khi tải.

## Đã hoạt động

- Cửa hàng responsive, tìm kiếm, lọc danh mục, sắp xếp, yêu thích và chi tiết sản phẩm.
- Giỏ hàng lưu trên trình duyệt, thay số lượng, tính phí ở máy chủ và đặt hàng COD.
- Kiểm tra giá/tồn kho tại thời điểm ghi đơn bằng trigger trong cùng giao dịch D1; không bán vượt kho. Hủy đơn hoàn lại tồn kho một lần.
- Khóa idempotency chống tạo lại đơn khi gửi lại cùng yêu cầu.
- Đặt lịch kỹ thuật, quản lý khách hàng/địa chỉ/khung giờ và xác nhận trạng thái.
- Quản trị sản phẩm, giá, tồn kho, ẩn sản phẩm, đơn hàng, lịch kỹ thuật, thư viện ảnh và thông tin cửa hàng.
- Font tiếng Việt được lưu cục bộ. Ảnh danh mục hiện dùng ảnh minh họa từ Unsplash.

## Kết nối đã chuẩn bị

| Dịch vụ    | Phạm vi đã có                                                            | Điều kiện sử dụng thật                                    |
| ---------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| payOS      | API tạo link thanh toán, HMAC-SHA256, webhook xác minh chữ ký và số tiền | Tài khoản/kênh payOS và 3 khóa môi trường                 |
| Cloudinary | Upload có chữ ký ở máy chủ; ảnh WebP                                     | Cloud name, API key, API secret; khi chưa có sẽ dùng R2   |
| Haravan    | Nhập sản phẩm, tồn kho, đơn hàng; phân trang tối đa 1.000 bản ghi/lượt   | Token có quyền đọc tương ứng; sàn đã liên kết tại Haravan |
| Messenger  | Nút mở hội thoại m.me                                                    | Page ID/username tại Cài đặt                              |
| Zalo       | Liên kết OA và widget chính thức                                         | OA ID tại Cài đặt, tài khoản OA phù hợp                   |

Haravan hiện là luồng nhập theo yêu cầu, chưa đẩy dữ liệu hai chiều và chưa có lịch tự động. Chưa tích hợp API Shopee/Lazada/TikTok trực tiếp, MoMo, VNPay, ZaloPay hoặc hộp thư chat hợp nhất. Các API đó cần tài khoản đối tác, quyền và hợp đồng riêng. ZaloPay, MoMo và Viettel Money hiện có cấu hình liên kết nhận tiền với đối soát thủ công như mô tả bên dưới.

## Chạy cục bộ

Yêu cầu Node >=22.13 và pnpm 11.25.0.

```sh
pnpm install
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_brown_micromax.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_faithful_risque.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_calm_prima.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_stale_rogue.sql
pnpm dev --port 5175
```

Chỉ chạy mỗi migration một lần theo thứ tự. Với cơ sở dữ liệu hiện có, chỉ áp dụng các migration còn thiếu. Mở URL Local mà máy chủ in ra. File `Mo-InfinitiSeller.cmd` có thể khởi động lại bản đã cài trên Windows.

Bản preview portable mô phỏng đăng nhập ở `/signin-with-chatgpt?return_to=/` bằng tài khoản cục bộ `seedy@sites.test`. Mô phỏng này không được đưa vào bản production.

## Cấu hình dịch vụ

Sao chép `.dev.vars.example` thành `.dev.vars` cho môi trường cục bộ. Với Sites, cấu hình các tên biến tương ứng bằng runtime secrets và triển khai lại. Không đưa khóa thật vào GitHub hoặc mã phía trình duyệt.

- payOS: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`.
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Haravan: `HARAVAN_ACCESS_TOKEN`.

Webhook payOS là `/api/webhooks/payos`. Site mới được xuất bản riêng tư; cổng thanh toán bên ngoài không gọi được endpoint riêng tư. Chỉ kích hoạt thanh toán thật sau khi có domain/truy cập công khai phù hợp, tài khoản payOS và đã kiểm tra webhook. Trang trả về từ payOS không được dùng làm bằng chứng đã thanh toán. Đơn chờ thanh toán giữ hàng cho tới khi chủ cửa hàng hủy; chưa có tác vụ tự giải phóng đơn bỏ dở.

## Quyền quản trị

Site giữ quyền riêng tư mặc định. Chủ Site mở `/admin` lần đầu để ghi nhận user ID làm chủ cửa hàng; những lần tiếp theo API kiểm tra đúng ID này. Khởi tạo chủ cửa hàng khi Site còn riêng tư trước khi mở cho khách. Mọi thao tác quản trị được kiểm tra phía máy chủ; khách chỉ đọc đơn của chính họ. Cơ chế nhận diện dựa trên header được Sites xác thực, không dùng header tự gửi từ Internet khi tự triển khai bằng hạ tầng khác.

Vào Cài đặt để thêm số điện thoại thật, địa chỉ, khu vực phục vụ, Facebook Page và Zalo OA. Giá/tồn kho/sản phẩm mẫu cần được thay bằng thông tin bán hàng thực tế.

## Kiểm tra

```sh
pnpm exec tsc --noEmit
pnpm build
node scripts/verify-commerce.mjs http://127.0.0.1:5175
```

Script kiểm tra chỉ cho phép máy chủ loopback, dùng dữ liệu kiểm thử cục bộ. Nó kiểm tra quyền truy cập, tính giá, idempotency, tranh chấp tồn kho, hủy đơn, lịch hẹn, lưu ảnh và chặn yêu cầu khác nguồn. Khóa thanh toán thực tế chưa được cung cấp nên chưa thử giao dịch thật. Chưa đo cam kết tải dưới một giây trên thiết bị/mạng thực tế.

## Cấu trúc chính

- `app/`: trang chủ, quản trị và API.
- `components/shop/`: cửa hàng, giỏ hàng, đặt lịch, quản trị và tải ảnh.
- `lib/`: catalog, Zustand, truy cập máy chủ và payOS.
- `db/`, `drizzle/`: schema và migration/trigger tồn kho.
- `.openai/hosting.json`: định danh Site và khai báo D1/R2, không chứa secret.
- `legacy/`: bản website học web trước đây được giữ lại.

Tài liệu API: [payOS](https://payos.vn/docs/api/), [kiểm tra chữ ký payOS](https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/), [Cloudinary](https://cloudinary.com/documentation/upload_images), [Haravan](https://docs.haravan.com/docs/get-started/overview/), [Zalo Widget](https://developers.zalo.me/docs/social/zalo-chat-widget).

Giấy phép mã nguồn: MIT. Ảnh mẫu và thương hiệu sản phẩm thuộc chủ sở hữu tương ứng; thay bằng ảnh được phép sử dụng cho danh mục của cửa hàng.

## Bài viết và nội dung giới thiệu

- `/bai-viet` là danh sách bài đã đăng; `/bai-viet/[slug]` là trang đọc chi tiết có metadata.
- `/gioi-thieu` dẫn tới bài giới thiệu công ty hiện đang xuất bản.
- Quản trị → Bài viết: tạo, sửa, xem trước và chọn Bản nháp / Đã đăng / Lưu trữ. Nháp và lưu trữ không xuất hiện trong danh sách hoặc URL công khai.
- Mở thẳng `/admin/bai-viet` để quản lý bài viết. Các mục quản trị giữ đường dẫn hiện tại khi chuyển mục, tải lại hoặc dùng nút quay lại.
- Nội dung hỗ trợ tiêu đề `##`, danh sách, `**chữ đậm**`, `*in nghiêng*`, liên kết HTTPS/nội bộ/`tel:`, ảnh Markdown, khung ghi chú `>` và bảng Markdown. HTML được hiển thị như văn bản, không thực thi. Bảng cuộn ngang trong khung khi dùng điện thoại.
- Mỗi bài có Meta Title và Meta Description riêng trong mục SEO của trình soạn thảo. Nếu để trống, trang dùng tiêu đề và mô tả ngắn của bài. Metadata có canonical và ảnh Open Graph.
- Bài giới thiệu đã soạn được khởi tạo ngoài migration bằng thao tác INSERT OR IGNORE; các lần triển khai sau không ghi đè nội dung người dùng sửa.
- Bài dịch vụ tại nhà ở `/bai-viet/sua-may-tinh-laptop-may-in-lap-mang-camera-tai-nha` được khởi tạo theo cùng cách, gồm nội dung chủ cửa hàng cung cấp, bảng giá, hotline/Zalo và ảnh minh họa có ghi nguồn trong [tài liệu ảnh](docs/article-images.md).

## Bộ bài địa phương và SEO

- Có 220 bài địa phương trong địa bàn Hưng Yên cũ: 39 xã/phường tại mốc 1/7/2025, 139 đơn vị ngay trước mốc này, 32 tên trước tháng 12/2024 và 10 huyện/thị xã/thành phố cũ. Không gồm Thái Bình cũ. Dữ liệu và các trường hợp chia một phần địa bàn được ghi tại [nguồn đối chiếu](docs/hung-yen-sources.md).
- Mỗi bài tổng hợp sáu nhóm dịch vụ, có đoạn địa danh riêng, liên kết tên cũ–mới, tag, tiêu đề/mô tả SEO, canonical, Open Graph/Twitter và JSON-LD BlogPosting/BreadcrumbList. Không tạo chi nhánh, đánh giá hoặc tư cách đại lý nhà mạng giả.
- Trang bài viết hỗ trợ tìm không dấu, lọc tên cũ/mới, tag và phân trang 12 bài. Quản trị phân trang 20 bài, chỉ tải nội dung đầy đủ khi mở bài để sửa; danh sách không gửi toàn bộ văn bản của hàng trăm bài xuống điện thoại.
- Các bài khởi tạo có ID ổn định, INSERT OR IGNORE theo lô 25; cờ `editorial-regions-v1` đánh dấu hoàn tất. Không ghi đè chỉnh sửa/trạng thái người quản trị ở các lần xem hoặc triển khai sau.
- `/sitemap.xml` chỉ chứa trang và bài đang xuất bản. `/robots.txt` khai báo sitemap và loại khu vực quản trị/API; quản trị vẫn được bảo vệ bằng đăng nhập, không phụ thuộc robots. Kết quả tìm kiếm có noindex để giảm trang trùng lặp.
- Website đang riêng tư sẽ không được Google thu thập. Chỉ mở công khai khi chủ sở hữu xác nhận; sau đó cần xác minh tài sản Search Console và gửi sitemap bằng tài khoản của chủ sở hữu. Sitemap, tag hoặc metadata không bảo đảm Google lập chỉ mục hay thứ hạng.
- Kiểm tra thêm: `node scripts/verify-service-article.mjs http://127.0.0.1:5175` và `node scripts/verify-regional-seo.mjs http://127.0.0.1:5175`.

## Liên kết ZaloPay, MoMo và Viettel Money

Vào Quản trị → Thanh toán. Mỗi phương thức có công tắc bật/tắt, liên kết nhận tiền HTTPS, tên người nhận và hướng dẫn bổ sung. Mặc định cả ba đều tắt. Chỉ nhập URL nhận thanh toán từ tài khoản của bạn, thuộc tên miền chính thức được ứng dụng chấp nhận; không nhập trang chủ hoặc URL API.

Đây là thanh toán qua liên kết và đối soát thủ công, chưa phải tích hợp API ví tự động. Khi tạo đơn, máy chủ lưu bản chụp URL, người nhận, hướng dẫn, số tiền và mã tham chiếu. Khách xem Đơn hàng của bạn để mở liên kết và sao chép nội dung chuyển tiền. Mở liên kết không làm thay đổi trạng thái thanh toán.

Sau khi kiểm tra giao dịch thực nhận, chủ cửa hàng dùng Xác nhận sau đối soát trong danh sách đơn, nhập mã giao dịch và xác nhận đã kiểm tra. Đơn ví chưa xác nhận không thể chuyển sang Đang giao / Hoàn thành. Đơn đã trả tiền không thể hủy trực tiếp để tránh hoàn kho khi chưa xử lý hoàn tiền. payOS vẫn dùng luồng webhook có chữ ký riêng.

Có thể chạy thêm kiểm tra nội dung/ví trên preview cục bộ:

```sh
node scripts/verify-content-wallets.mjs http://127.0.0.1:5175
```

Script dùng dữ liệu kiểm thử cục bộ, không gửi yêu cầu hay giao dịch tới nhà cung cấp ví. Nó khôi phục cấu hình thanh toán ban đầu sau kiểm tra.
