import data from "@/data/hung-yen-localities.json";
export const regionalData = data;
const kinds: Record<string, string> = {
  xa: "xã",
  phuong: "phường",
  "thi-tran": "thị trấn",
  huyen: "huyện",
  "thi-xa": "thị xã",
  "thanh-pho": "thành phố",
};
const district = (id: string) => data.districts.find((d) => d.id === id)!;
export type RegionalArea = {
  key: string;
  name: string;
  label: string;
  group: string;
  districtIds: string[];
  details: string;
  related: { key: string; label: string }[];
};
const newKey = (id: string) => `moi-${id}`;
const newLabel = (u: { kind: string; name: string }) =>
  `${kinds[u.kind]} ${u.name}`;
export function regionalAreas(): RegionalArea[] {
  const current: RegionalArea[] = data.newUnits.map((u) => ({
    key: newKey(u.id),
    name: u.name,
    label: newLabel(u),
    group: "Xã/phường hiện hành",
    districtIds: u.districtIds,
    details: `Khi đặt lịch tại ${u.name}, vui lòng cung cấp địa chỉ cụ thể để cửa hàng xác nhận lịch hỗ trợ.`,
    related: [],
  }));
  const oldUnits = [
    ...new Map(data.newUnits.flatMap((u) => u.oldUnits).map((u) => [u.id, u])).values(),
  ];
  const previous: RegionalArea[] = oldUnits.map((u) => ({
    key: `cu-${u.id}`,
    name: u.name,
    label: `${kinds[u.kind]} ${u.name}`,
    group: "Xã/phường/thị trấn",
    districtIds: [u.districtId],
    details: `Khi đặt lịch tại ${u.name}, vui lòng cung cấp địa chỉ cụ thể để cửa hàng xác nhận lịch hỗ trợ.`,
    related: [],
  }));
  // Ưu tiên xã/phường hiện hành và chỉ bổ sung một bài cho tên chưa xuất hiện.
  const seen = new Set(current.map((a) => a.label.normalize("NFC").trim().toLocaleLowerCase("vi")));
  return [...current, ...previous.filter((a) => {
    const name = a.label.normalize("NFC").trim().toLocaleLowerCase("vi");
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  })];
}

const serviceTags = [
  "Sửa máy tính",
  "Sửa laptop",
  "Sửa máy in",
  "Lắp camera",
  "Mạng Wi-Fi LAN",
  "Truyền hình",
];
export function regionalArticles() {
  return regionalAreas().map((area) => ({
    id: `regional-v1-${area.key}`,
    area_key: area.key,
    slug: `dich-vu-tai-${area.key}`,
    title: `Sửa máy tính, laptop, máy in & lắp camera tại ${area.label}`,
    seo_title: `Dịch vụ máy tính, camera, mạng tại ${area.label}`,
    seo_description: `Infiniti Seller nhận sửa máy tính, laptop, máy in, lắp camera, hỗ trợ mạng và truyền hình tại ${area.label}. Hotline 0867899987, 8h–21h.`,
    excerpt: `Nhận yêu cầu sửa máy tính, laptop, máy in; lắp camera, mạng và hỗ trợ truyền hình tại ${area.label}. Xem giá tham khảo và đặt lịch 0867899987.`,
    tags: [
      ...serviceTags,
      "Hưng Yên",
      area.group,
      area.name,
      ...area.districtIds.map((id) => district(id).name),
    ],
    cover_image: area.group.startsWith("Xã/phường mới")
      ? "/images/lap-dat-mang-tai-nha.jpg"
      : "/images/sua-may-tinh-tai-nha.jpg",
    category: "Dịch vụ tại Hưng Yên",
    author: "Infiniti Seller",
    body: `Bạn cần sửa máy tính không lên nguồn, laptop chạy chậm, máy in không nhận lệnh; lắp đặt camera, cải thiện mạng Wi-Fi hoặc kiểm tra kết nối truyền hình tại **${area.label}**? Infiniti Seller tiếp nhận thông tin thiết bị và địa chỉ để tư vấn phương án, xác nhận lịch hỗ trợ phù hợp.

> **Hotline:** [0867899987](tel:0867899987) · [Nhắn Zalo](https://zalo.me/0867899987)
> **Giờ liên hệ:** 8h00–21h00, kể cả cuối tuần và ngày lễ.
> **Đặt lịch:** Cung cấp địa chỉ cụ thể để cửa hàng xác nhận khả năng đến nơi, thời gian và chi phí di chuyển trước khi thực hiện.

## Sửa chữa máy tính để bàn tại ${area.name}

Nhận kiểm tra máy không khởi động, treo khi mở ứng dụng, lỗi màn hình xanh, quạt kêu hoặc máy nóng bất thường. Khi liên hệ, bạn nên mô tả máy có sáng đèn hay quay quạt không, lỗi xuất hiện trước hay sau khi cài đặt/nâng cấp và công việc cần ưu tiên khôi phục.

- Kiểm tra hệ điều hành, phần mềm, bộ nhớ và kết nối thiết bị ngoại vi.
- Tư vấn nâng cấp RAM, SSD và kiểm tra tương thích trước khi thay linh kiện.
- Vệ sinh, kiểm tra tản nhiệt và trao đổi phương án theo tình trạng máy.

## Sửa laptop, vệ sinh và nâng cấp

Hỗ trợ laptop chạy chậm, lỗi bàn phím, pin, sạc, màn hình và kết nối Wi-Fi. Bạn hãy gửi hãng, model và ảnh/video lỗi qua Zalo để việc tư vấn tập trung đúng thiết bị. Nếu máy còn bảo hành nhà sản xuất, cần trao đổi trước khi tháo máy hoặc thay linh kiện.

Trước khi xử lý, khách hàng và kỹ thuật viên thống nhất phạm vi can thiệp. Dữ liệu cần giữ, tài khoản đang dùng và nhu cầu sao lưu được trao đổi; không yêu cầu gửi mật khẩu hoặc thông tin ngân hàng qua bài viết.

## Sửa máy in và nạp mực tại ${area.name}

Tiếp nhận máy in kẹt giấy, không cuốn giấy, bản in mờ/lem, in trắng hoặc mất kết nối USB, LAN, Wi-Fi. Với nhu cầu nạp mực hoặc thay trống/gạt/bao lụa, cần xác định đúng model và kiểm tra tình trạng vật tư.

- Gửi ảnh bản in lỗi và tên model máy in.
- Cho biết máy dùng riêng hay chia sẻ giữa nhiều máy tính.
- Kỹ thuật viên kiểm tra, báo hạng mục và chi phí trước khi xử lý.

## Tư vấn, lắp đặt và sửa camera

Hỗ trợ kiểm tra camera mất hình, không xem từ điện thoại, lỗi lưu trữ; tư vấn vị trí lắp mới, góc quan sát và kết nối mạng. Phương án được trao đổi theo số vị trí cần theo dõi, điều kiện trong/ngoài nhà, nguồn điện và thời gian lưu mong muốn.

Khi bàn giao, khách hàng kiểm tra hình ảnh trực tiếp, khả năng xem lại và quyền truy cập tài khoản. Thiết bị, vật tư, công lắp đặt và điều kiện bảo hành được làm rõ trong báo giá cụ thể.

## Dịch vụ mạng Wi-Fi, LAN

Nhận yêu cầu Wi-Fi yếu, mất mạng từng khu vực, dây/đầu nối lỗi hoặc cần thêm điểm phát. Khi đặt lịch tại ${area.name}, hãy mô tả số tầng, nơi đặt router và vị trí cần kết nối máy tính, máy in hoặc camera.

Phạm vi hỗ trợ gồm kiểm tra đường dây nội bộ, bấm đầu mạng, cấu hình router/Mesh và kết nối thiết bị. Sự cố đường truyền, hợp đồng hoặc thiết bị thuộc nhà mạng cần phối hợp đúng đơn vị cung cấp; cửa hàng xác nhận phạm vi được xử lý trước khi làm.

## Hỗ trợ kỹ thuật truyền hình

Kiểm tra kết nối TV/đầu thu với mạng gia đình, dây HDMI/LAN, nguồn vào và ứng dụng truyền hình khi khách đã có tài khoản hoặc gói thuê bao phù hợp. Cần phân biệt lỗi TV/đầu thu, lỗi mạng nội bộ và lỗi dịch vụ từ nhà cung cấp.

Hãy gửi model TV/đầu thu, tên ứng dụng và mã lỗi. Việc mở gói cước, khôi phục thuê bao hoặc sự cố thuộc hệ thống nhà cung cấp cần làm việc với đơn vị đó. Bài viết này giới thiệu hỗ trợ kỹ thuật, không xác nhận tư cách đại lý của bất kỳ nhà mạng nào.

## Giá tham khảo và quy trình đặt lịch

| Hạng mục | Giá tham khảo (VNĐ) |
| --- | --- |
| Cài hệ điều hành và phần mềm cơ bản | 150.000–250.000 |
| Vệ sinh laptop/PC | 100.000–200.000 |
| Nạp mực máy in | 100.000–180.000 |
| Kiểm tra, xử lý lỗi mạng nội bộ | 100.000–200.000 |
| Lắp đặt, cấu hình camera Wi-Fi | 150.000–300.000/mắt |
| Hỗ trợ truyền hình, khảo sát hệ thống | Báo giá theo tình trạng và phạm vi công việc |

*Giá lấy từ bảng dịch vụ cửa hàng cung cấp, là mức tham khảo. Chi phí phụ thuộc model, tình trạng, linh kiện/vật tư và địa điểm; cần nhận báo giá cụ thể trước khi đồng ý thực hiện.*

1. **Gửi yêu cầu:** Tên thiết bị, mô tả lỗi, địa chỉ tại ${area.name}, khung giờ mong muốn.
2. **Xác nhận lịch:** Cửa hàng làm rõ phạm vi, khả năng đến nơi, thời gian và chi phí liên quan.
3. **Kiểm tra và báo giá:** Thống nhất hạng mục trước khi sửa, thay thế hoặc lắp đặt.
4. **Nghiệm thu:** Khách kiểm tra chức năng đã xử lý, nhận thông tin bảo hành phù hợp từng hạng mục và thanh toán.

## Liên hệ Infiniti Seller tại khu vực ${area.name}

Gọi [0867899987](tel:0867899987) hoặc [gửi ảnh thiết bị qua Zalo](https://zalo.me/0867899987) từ 8h–21h. Địa chỉ cửa hàng do chủ đơn vị cung cấp: **Tân Phú - Việt Yên - Hưng Yên**. Địa chỉ này là thông tin liên hệ chung; bài theo địa phương không công bố thêm chi nhánh tại từng xã.

[Gửi yêu cầu đặt lịch trên website](/#dich-vu) · [Xem bài dịch vụ và bảng giá đầy đủ](/bai-viet/sua-may-tinh-laptop-may-in-lap-mang-camera-tai-nha) · [Giới thiệu Infiniti Seller](/gioi-thieu).

- [Tra cứu toàn bộ bài dịch vụ Hưng Yên](/bai-viet?category=regional).

*Ảnh bìa là ảnh minh họa.*`,
  }));
}
