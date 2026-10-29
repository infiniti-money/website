import type { Product } from "./catalog";

type Family = { category: string; products: string[]; brands: string[]; specs: string[]; image: string };
const families: Family[] = [
  { category:"Laptop", products:["Laptop văn phòng","Laptop đồ họa","Laptop gaming","Laptop mỏng nhẹ"], brands:["Lenovo","Dell","ASUS","HP","Acer","MSI"], specs:["RAM 8GB · SSD 256GB","RAM 16GB · SSD 512GB","RAM 32GB · SSD 1TB","Màn hình 14 inch","Màn hình 15.6 inch"],image:"/product-placeholder.svg" },
  { category:"Máy tính PC", products:["PC văn phòng","PC gaming","PC thiết kế","Máy trạm"], brands:["Intel","AMD","ASUS","Gigabyte","MSI","Lenovo"],specs:["RAM 8GB · SSD 256GB","RAM 16GB · SSD 512GB","RAM 32GB · SSD 1TB","Mini Tower","Full Tower"],image:"/product-placeholder.svg" },
  { category:"Điện thoại", products:["Điện thoại thông minh","Điện thoại màn hình lớn","Điện thoại phổ thông","Điện thoại chụp ảnh"],brands:["Samsung","Xiaomi","OPPO","vivo","realme","Apple"],specs:["128GB · 5G","256GB · 5G","512GB · OLED","Pin dung lượng lớn","Sạc nhanh"],image:"/product-placeholder.svg" },
  { category:"Tai nghe", products:["Tai nghe Bluetooth","Tai nghe gaming","Tai nghe chụp tai","Tai nghe có dây"],brands:["Sony","JBL","Anker","Logitech","Soundcore","Edifier"],specs:["Chống ồn","Micro đàm thoại","USB-C","Bluetooth 5.x","Đeo thoải mái"],image:"/product-placeholder.svg" },
  { category:"Máy in", products:["Máy in laser","Máy in phun","Máy in đa năng","Máy in nhiệt POS","Máy in hóa đơn","Máy in di động portable","Máy in tem nhãn","Máy in ảnh","Máy in kim","Máy in khổ A3","Máy in mã vạch","Máy in Bluetooth"],brands:["Canon","HP","Brother","Epson","Pantum","Ricoh"],specs:["Khổ A4","Wi-Fi","In 2 mặt","Đơn sắc","In màu"],image:"/product-placeholder.svg" },
  { category:"Máy photocopy", products:["Máy photocopy văn phòng","Máy photocopy đa năng","Máy photocopy khổ A3","Máy photocopy màu","Máy photocopy laser","Máy photocopy tốc độ cao","Máy photocopy cho thuê","Máy photocopy có in mạng"],brands:["Ricoh","Canon","Xerox","Sharp","Toshiba","Konica Minolta"],specs:["Khổ A3","In đảo mặt","Kết nối LAN","Máy đa chức năng","Khay giấy lớn"],image:"/product-placeholder.svg" },
  { category:"Linh kiện PC", products:["SSD","RAM","Nguồn máy tính","Bo mạch chủ"],brands:["Kingston","Samsung","Corsair","Gigabyte","ASUS","Crucial"],specs:["Chuẩn SATA","Chuẩn NVMe","Dung lượng tùy chọn","Tương thích theo mainboard","Bảo hành theo sản phẩm"],image:"/product-placeholder.svg" },
  { category:"Phụ kiện", products:["Chuột máy tính","Bàn phím","Hub USB","Cáp chuyển đổi"],brands:["Logitech","Ugreen","Baseus","Rapoo","Anker","Orico"],specs:["USB-C","Không dây","USB 3.0","Kết nối đa thiết bị","Dùng cho văn phòng"],image:"/product-placeholder.svg" },
  { category:"Phụ kiện máy in", products:["Hộp mực","Trống in","Gạt mực","Cụm sấy","Trục cao su","Bộ kéo giấy","Chip mực","Dây nguồn máy in","Khay giấy","Đầu phun","Cáp USB máy in","Giấy in nhiệt"],brands:["Canon","HP","Brother","Epson","Pantum","Ricoh"],specs:["Cần kiểm tra model","Linh kiện thay thế","Vật tư tiêu hao","Dùng theo mã máy","Yêu cầu tư vấn"],image:"/product-placeholder.svg" },
  { category:"Phụ kiện máy photocopy",products:["Trống photocopy","Mực photocopy","Lô sấy","Bánh xe kéo giấy"],brands:["Ricoh","Canon","Xerox","Sharp","Toshiba","Konica Minolta"],specs:["Theo mã máy","Cần kiểm tra tương thích","Vật tư thay thế","Dùng cho văn phòng","Yêu cầu báo giá"],image:"/product-placeholder.svg" },
  { category:"Camera",products:["Camera Wi-Fi","Camera ngoài trời","Camera IP","Đầu ghi hình"],brands:["Dahua","Hikvision","Ezviz","Imou","TP-Link","Reolink"],specs:["2K","Quan sát ban đêm","Kết nối mạng","Hỗ trợ ghi hình","Lắp đặt theo khảo sát"],image:"/product-placeholder.svg" },
  { category:"Thiết bị mạng",products:["Router Wi-Fi","Bộ phát Mesh","Switch LAN","Access Point"],brands:["TP-Link","ASUS","Mercusys","Ubiquiti","Tenda","D-Link"],specs:["Wi-Fi 6","Gigabit LAN","Băng tần kép","Phủ sóng nhiều phòng","Dùng cho văn phòng"],image:"/product-placeholder.svg" },
];

/** 12 x 1500 = 18.000 illustrative catalog entries. Never treat them as actual stock. */
export function demoProductCount(category?: string): number {
  return !category || category === "Tất cả" ? families.length * 1500 :
    families.some(f => f.category === category) ? 1500 : 0;
}
export function generateDemoProducts(): Product[] {
  const result: Product[] = [];
  for (const f of families) {
    for (let i = 0; i < 1500; i++) {
      const family = f.products[i % f.products.length];
      const brand = f.brands[Math.floor(i / f.products.length) % f.brands.length];
      const spec = f.specs[Math.floor(i / (f.products.length * f.brands.length)) % f.specs.length];
      const variant = Math.floor(i / (f.products.length * f.brands.length * f.specs.length)) + 1;
      result.push({
        id:`demo-${f.category.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z]/g,"-").toLowerCase()}-${i+1}`,
        name:`${family} ${brand} - mẫu tham khảo ${variant}-${i+1}`,
        category:f.category, price:0, original_price:0, stock:0,
        image:f.image, specs:spec, tag:"Danh mục tham khảo",
        description:`Sản phẩm mẫu thuộc nhóm ${f.category}. Thông số chỉ dùng minh họa cho danh mục, không xác nhận có sẵn hàng hoặc thông số của model thực. Liên hệ cửa hàng để nhận tư vấn về sản phẩm thực tế và báo giá.`,
        active:1,
      });
    }
  }
  return result;
}
