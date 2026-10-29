// Các địa danh thuộc khu đô thị Ecopark Văn Giang, Hưng Yên.
// Nguồn đối chiếu: https://ecopark.com.vn/ecopark-overview.html
// https://ecoparker.com.vn/ban-do-ecopark
// https://vnexpress.net/bat-dong-san/du-an/detail/khu-do-thi-ecopark-481
const locations: Array<[string, string, string, string, string]> = [
  [
    "rung-co",
    "Rừng Cọ",
    "khu căn hộ",
    "đường vào tòa nhà, mã tòa và số căn hộ",
    "mạng Wi-Fi giữa các phòng, máy tính làm việc tại nhà và máy in dùng chung"
  ],
  [
    "pho-truc",
    "Phố Trúc",
    "khu nhà phố thương mại",
    "số nhà và vị trí mặt bằng kinh doanh",
    "máy tính bán hàng, máy in hóa đơn, Wi-Fi khách và camera cửa hàng"
  ],
  [
    "pho-cuc",
    "Phố Cúc",
    "khu nhà phố thương mại",
    "số nhà và lối tiếp cận cửa hàng",
    "camera mặt tiền, mạng nội bộ và thiết bị văn phòng"
  ],
  [
    "vuon-tung",
    "Vườn Tùng",
    "khu biệt thự",
    "số căn, cổng vào và vị trí đặt thiết bị",
    "phủ sóng Wi-Fi nhiều tầng, camera sân vườn và kết nối máy tính"
  ],
  [
    "vuon-mai",
    "Vườn Mai",
    "khu biệt thự",
    "số căn và lối vào",
    "Wi-Fi trong nhà, camera, máy in và máy tính gia đình"
  ],
  [
    "park-river",
    "Park River",
    "khu biệt thự và nhà phố",
    "số căn và cổng vào phân khu",
    "mạng nhiều tầng, camera và thiết bị làm việc tại nhà"
  ],
  [
    "aqua-bay",
    "Aqua Bay",
    "khu căn hộ",
    "tên tòa, tầng và số căn",
    "mạng Wi-Fi căn hộ, máy in, laptop và camera trong nhà"
  ],
  [
    "west-bay",
    "West Bay",
    "khu căn hộ",
    "tòa nhà, tầng và số căn",
    "router Wi-Fi, laptop học tập và thiết bị kết nối mạng"
  ],
  [
    "thao-nguyen",
    "Thảo Nguyên",
    "khu phố thương mại",
    "số nhà và vị trí kinh doanh",
    "máy tính quản lý bán hàng, máy in và camera cửa hàng"
  ],
  [
    "thuy-nguyen",
    "Thủy Nguyên",
    "khu phố thương mại",
    "số nhà và lối vào",
    "mạng cửa hàng, máy in hóa đơn và camera"
  ],
  [
    "thuy-truc",
    "Thủy Trúc",
    "khu nhà phố thương mại",
    "số nhà và vị trí cần hỗ trợ",
    "Wi-Fi, máy tính văn phòng và camera"
  ],
  [
    "mimosa-valley",
    "Mimosa Valley",
    "khu biệt thự",
    "số căn và cổng vào",
    "mạng nội bộ, camera và kết nối thiết bị nhiều phòng"
  ],
  [
    "marina-waterfront",
    "Marina Waterfront",
    "khu biệt thự và nhà phố",
    "số nhà và điểm hẹn",
    "Wi-Fi nhiều tầng, camera và thiết bị làm việc tại nhà"
  ],
  [
    "marina-arc",
    "Marina Arc",
    "khu nhà phố",
    "số nhà và vị trí cần lắp thiết bị",
    "mạng nội bộ, camera và máy tính phục vụ kinh doanh"
  ],
  [
    "sky-oasis",
    "Sky Oasis",
    "khu căn hộ",
    "tên tòa, tầng và số căn hộ",
    "Wi-Fi căn hộ, laptop, máy in và thiết bị gia đình thông minh"
  ],
  [
    "sol-forest",
    "Sol Forest",
    "khu căn hộ",
    "tên tòa, tầng và số căn hộ",
    "mạng không dây, thiết bị làm việc tại nhà và camera"
  ],
  [
    "haven-park",
    "Haven Park",
    "khu căn hộ",
    "tòa nhà, tầng và số căn",
    "laptop, máy in, router và kết nối mạng gia đình"
  ],
  [
    "ecopark-grand",
    "Ecopark Grand",
    "khu biệt thự đảo",
    "số căn và điểm hẹn tại cổng",
    "camera khuôn viên, Wi-Fi nhiều tầng và mạng nội bộ"
  ],
  [
    "sky-forest",
    "Sky Forest",
    "khu căn hộ",
    "tên tòa, tầng và số căn",
    "Wi-Fi trong căn hộ, máy tính, thiết bị ngoại vi và camera"
  ],
  [
    "swanlake-residences",
    "Swanlake Residences",
    "khu căn hộ",
    "tên tòa, tầng và số căn",
    "mạng gia đình, laptop và thiết bị kết nối Wi-Fi"
  ],
  [
    "the-landmark",
    "The Landmark",
    "khu căn hộ",
    "tên tòa, tầng và số căn",
    "máy tính, máy in và hệ thống mạng căn hộ"
  ],
  [
    "meraki-residences",
    "Meraki Residences",
    "khu căn hộ",
    "tên tòa, tầng và số căn",
    "laptop, Wi-Fi và kết nối thiết bị văn phòng tại nhà"
  ],
  [
    "ho-thien-nga",
    "Hồ Thiên Nga",
    "khu vực tiện ích",
    "điểm hẹn cụ thể gần khu vực hồ",
    "máy tính, mạng và camera tại các địa chỉ lân cận"
  ]
];
export function ecoparkArticles() {
  return locations.map(([key, name, type, addressHint, needs]) => {
    const place = `${name} - Ecopark Văn Giang`;
    return {
      id: `ecopark-v1-${key}`,
      area_key: `ecopark-${key}`,
      slug: `dich-vu-ky-thuat-ecopark-${key}`,
      title: `Sửa máy tính, laptop, máy in và lắp camera tại ${place}`,
      seo_title: `Sửa máy tính, lắp camera tại ${name} Ecopark`,
      seo_description: `Dịch vụ sửa laptop, máy tính, máy in, camera và Wi-Fi tại ${place}. Liên hệ Infiniti Seller 0867899987 để xác nhận lịch hỗ trợ.`,
      excerpt: `Tư vấn sửa máy tính, laptop, máy in và lắp đặt camera, Wi-Fi cho khách tại ${place}. Gửi thông tin thiết bị để nhận lịch và báo giá.`,
      tags: ["Dịch vụ tại Hưng Yên", "Ecopark", name, "Sửa laptop", "Sửa máy tính", "Sửa máy in", "Lắp camera", "Mạng Wi-Fi LAN"],
      cover_image: "/images/sua-may-tinh-tai-nha.jpg",
      category: "Dịch vụ tại Hưng Yên",
      author: "Infiniti Seller",
      body: `# Sửa máy tính, laptop, máy in và lắp camera tại ${place}

Bạn đang sinh sống hoặc kinh doanh tại **${name}**, Ecopark Văn Giang, Hưng Yên và cần hỗ trợ máy tính, máy in, Wi-Fi hoặc camera? Infiniti Seller tiếp nhận yêu cầu, tư vấn tình trạng thiết bị và xác nhận lịch hỗ trợ theo địa chỉ cụ thể. **${name}** là ${type} trong khu đô thị Ecopark; đây là bài giới thiệu khu vực phục vụ, không phải địa chỉ chi nhánh của cửa hàng.

> **Hotline/Zalo:** [0867899987](tel:0867899987) · [Nhắn Zalo](https://zalo.me/0867899987)
> **Giờ liên hệ:** 8h00–21h00, kể cả cuối tuần và ngày lễ.
> **Đặt lịch:** Vui lòng cung cấp ${addressHint}; cửa hàng sẽ xác nhận khả năng đến nơi và chi phí di chuyển trước khi thực hiện.

## Các nhu cầu kỹ thuật tại ${name}

Đối với ${type} này, khách hàng có thể cần hỗ trợ ${needs}. Kỹ thuật viên sẽ hỏi về thiết bị và vị trí thực tế trước khi đề xuất phương án, không mặc định mọi căn nhà hay căn hộ đều có cùng hạ tầng.

## Sửa máy tính để bàn và laptop

Tiếp nhận PC không lên nguồn, máy khởi động chậm, lỗi hệ điều hành, nóng máy hoặc lỗi kết nối thiết bị ngoại vi. Với laptop, cửa hàng tư vấn kiểm tra sạc, pin, bàn phím, màn hình, SSD và RAM theo model cụ thể. Khách nên gửi ảnh màn hình lỗi hoặc video mô tả để được tư vấn đúng vấn đề.

Trước khi sửa, hai bên trao đổi về dữ liệu cần giữ và phương án sao lưu; chỉ tiến hành thay linh kiện khi đã thống nhất chi phí và tình trạng bảo hành.

## Sửa máy in, kết nối máy in qua mạng

Hỗ trợ máy in không nhận lệnh, kẹt giấy, bản in mờ, lỗi chia sẻ USB/LAN/Wi-Fi và nhu cầu nạp mực. Hãy cung cấp model máy và ảnh bản in lỗi; việc thay mực, trống hoặc linh kiện được báo giá sau khi kiểm tra.

## Lắp đặt và kiểm tra camera

Tư vấn camera quan sát cho nhà ở, văn phòng hoặc cửa hàng; kiểm tra mất hình, lỗi kết nối điện thoại và khả năng lưu hình. Vị trí lắp đặt, nguồn điện, mạng và quyền riêng tư cần được thống nhất trước khi thi công. Đối với tòa nhà hoặc phân khu có quy định quản lý, khách hàng cần được phép thi công theo quy định tại địa điểm.

## Kiểm tra Wi-Fi và mạng LAN

Hỗ trợ Wi-Fi yếu, rớt kết nối, chia sẻ máy in, bấm đầu dây mạng, kiểm tra router và đề xuất bổ sung điểm phát khi cần. Với nhu cầu phủ sóng nhiều phòng hoặc nhiều tầng, phương án cần dựa trên khảo sát thực tế thay vì cam kết tốc độ chưa đo.

## Hỗ trợ kết nối TV và truyền hình

Kiểm tra kết nối TV/đầu thu với Wi-Fi, LAN, HDMI và ứng dụng truyền hình đã được khách hàng đăng ký hợp lệ. Các sự cố thuê bao hoặc hạ tầng thuộc nhà cung cấp sẽ được hướng dẫn liên hệ đúng đơn vị.

## Bảng giá tham khảo

| Dịch vụ | Giá tham khảo |
| --- | --- |
| Cài hệ điều hành và phần mềm cơ bản | 150.000–250.000đ |
| Vệ sinh laptop/PC | 100.000–200.000đ |
| Nạp mực máy in | 100.000–180.000đ |
| Kiểm tra, xử lý mạng nội bộ | 100.000–200.000đ |
| Lắp đặt, cấu hình camera Wi-Fi | 150.000–300.000đ/mắt |
| Kiểm tra kết nối truyền hình | Báo giá theo tình trạng |

*Giá tham khảo, chưa mặc định bao gồm vật tư, linh kiện và chi phí di chuyển. Cửa hàng xác nhận báo giá trước khi thực hiện.*

## Đặt lịch tại ${name}, Ecopark

1. Gửi tên thiết bị, model, triệu chứng và ảnh/video lỗi nếu có.
2. Cung cấp ${addressHint}, thời gian mong muốn và hướng dẫn ra vào nếu cần.
3. Nhận tư vấn, xác nhận lịch và báo chi phí dự kiến.
4. Kiểm tra, nghiệm thu và nhận hướng dẫn bảo hành sau xử lý.

Liên hệ [0867899987](tel:0867899987) hoặc [Zalo](https://zalo.me/0867899987). [Đặt lịch trên website](/#dich-vu) · [Xem các bài dịch vụ tại Hưng Yên](/bai-viet?category=regional).

*Infiniti Seller là đơn vị dịch vụ kỹ thuật độc lập, không tự nhận là ban quản lý, chủ đầu tư hoặc đơn vị bảo hành được Ecopark ủy quyền.*`,
    };
  });
}
