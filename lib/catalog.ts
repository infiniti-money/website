export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price: number;
  stock: number;
  image: string;
  description: string;
  specs: string;
  tag: string;
  active: number;
  external_id?: string | null;
};
export type ShopSettings = {
  brand: string;
  phone: string;
  address: string;
  serviceArea: string;
  facebookPage: string;
  zaloOa: string;
  shipping: number;
  freeShipping: number;
};
export const defaults: ShopSettings = {
  brand: "Infiniti Seller",
  phone: "",
  address: "",
  serviceArea: "Liên hệ để xác nhận khu vực phục vụ",
  facebookPage: "",
  zaloOa: "",
  shipping: 30000,
  freeShipping: 2000000,
};
export const money = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
export const categories = [
  "Tất cả", "Laptop", "Máy tính PC", "Điện thoại", "Tai nghe",
  "Máy in", "Máy photocopy", "Linh kiện PC", "Phụ kiện",
  "Phụ kiện máy in", "Phụ kiện máy photocopy", "Camera", "Thiết bị mạng",
];
export const services = [
  {
    id: "computer",
    name: "Sửa máy tính & laptop",
    detail: "Chẩn đoán lỗi, vệ sinh, nâng cấp và cài đặt phần mềm.",
    price: "Báo giá sau kiểm tra",
    icon: "laptop",
  },
  {
    id: "printer",
    name: "Sửa chữa máy in",
    detail: "Xử lý kẹt giấy, lỗi bản in, bảo trì và thay linh kiện.",
    price: "Báo giá sau kiểm tra",
    icon: "printer",
  },
  {
    id: "camera",
    name: "Lắp đặt camera",
    detail: "Tư vấn vị trí, thi công và cấu hình xem từ xa.",
    price: "Khảo sát & tư vấn",
    icon: "camera",
  },
  {
    id: "network",
    name: "Lắp đặt mạng & Wi-Fi",
    detail: "Đi dây mạng, tối ưu vùng phủ sóng cho nhà và văn phòng.",
    price: "Khảo sát & tư vấn",
    icon: "wifi",
  },
];
const product = (
  id: string,
  name: string,
  category: string,
  price: number,
  original_price: number,
  stock: number,
  photo: string,
  specs: string,
  tag: string,
): Product => ({
  id,
  name,
  category,
  price,
  original_price,
  stock,
  image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=85`,
  description: `${name}: giải pháp công nghệ cho học tập, làm việc và cuộc sống. Thông tin, hình ảnh và giá hiện là dữ liệu minh họa; cập nhật tại phần quản trị trước khi kinh doanh.`,
  specs,
  tag,
  active: 1,
});
export const sampleProducts: Product[] = [
  product(
    "lap-01",
    "Lenovo ThinkPad T14 Gen 4",
    "Laptop",
    18990000,
    21490000,
    8,
    "photo-1588872657578-7efd1f1555ed",
    "Core i5 · RAM 16GB · SSD 512GB",
    "Bán chạy",
  ),
  product(
    "lap-02",
    "ASUS Vivobook 15 OLED",
    "Laptop",
    15990000,
    17990000,
    12,
    "photo-1496181133206-80ce9b88a853",
    "Core i5 · RAM 16GB · OLED 15.6”",
    "Giá tốt",
  ),
  product(
    "pc-01",
    "PC Creator Studio i5",
    "Máy tính PC",
    12490000,
    13990000,
    6,
    "photo-1587831990711-23ca6441447b",
    "Core i5 · RAM 16GB · SSD 500GB",
    "Build theo yêu cầu",
  ),
  product(
    "cam-01",
    "Camera Wi-Fi trong nhà 2K",
    "Camera",
    690000,
    890000,
    25,
    "photo-1558002038-1055907df827",
    "2K · Xoay 360° · Đàm thoại 2 chiều",
    "Dễ lắp đặt",
  ),
  product(
    "print-01",
    "Máy in laser văn phòng",
    "Máy in",
    3290000,
    3590000,
    5,
    "photo-1612815154858-60aa4c59eaa6",
    "Laser đơn sắc · USB · A4",
    "Văn phòng",
  ),
  product(
    "acc-01",
    "Bàn phím cơ không dây",
    "Phụ kiện",
    1190000,
    1490000,
    18,
    "photo-1587829741301-dc798b83add3",
    "Bluetooth · USB-C · Layout 75%",
    "Mới về",
  ),
  product(
    "acc-02",
    "Chuột không dây Silent",
    "Phụ kiện",
    390000,
    490000,
    30,
    "photo-1527864550417-7fd91fc51a46",
    "2.4 GHz · Silent click · 1600 DPI",
    "Phụ kiện",
  ),
  product(
    "lap-03",
    "MacBook Air 13 inch",
    "Laptop",
    22990000,
    24990000,
    4,
    "photo-1517336714731-489689fd1ca8",
    "Apple Silicon · 16GB · SSD 256GB",
    "Mỏng nhẹ",
  ),
];
