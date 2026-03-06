# 👟 ShoeShop - Backend API 

Đây là hệ thống RESTful API phục vụ cho ứng dụng e-commerce chuyên mua bán giày dép. Hệ thống chịu trách nhiệm xử lý logic nghiệp vụ, xác thực người dùng, quản lý danh mục sản phẩm (size, màu sắc, thương hiệu), giỏ hàng, đơn hàng và tương tác với cơ sở dữ liệu.

## 🚀 Công nghệ sử dụng
* **Môi trường:** Node.js
* **Framework:** Express.js
* **Cơ sở dữ liệu:** MySQL
* **Bảo mật & Xác thực:** JSON Web Token (JWT)

## 🛠 Hướng dẫn cài đặt (Local Development)

Để chạy dự án này trên máy tính cá nhân, vui lòng làm theo các bước sau:

### 1. Yêu cầu hệ thống
* Node.js (phiên bản 14.x trở lên)
* MySQL Server (khuyến nghị dùng XAMPP hoặc MySQL Workbench)

### 2. Các bước cài đặt
**Bước 1: Clone mã nguồn**
```bash
git clone [https://github.com/ten-cua-ban/shoe-shop-api.git](https://github.com/ten-cua-ban/shoe-shop-api.git)
cd shoe-shop-api
Bước 2: Cài đặt thư viện

Bash
npm install
Bước 3: Thiết lập cơ sở dữ liệu

Tạo một database mới trong MySQL (ví dụ: shop_db).

Sử dụng công cụ quản lý MySQL để Import file shop_db.sql (được đính kèm sẵn trong thư mục gốc) vào database vừa tạo. File này đã bao gồm đầy đủ cấu trúc bảng, danh mục giày và dữ liệu mẫu.

Bước 4: Cấu hình biến môi trường

Tạo một file có tên .env ở thư mục gốc của dự án.

Sao chép nội dung từ file .env.example sang file .env và điền thông tin kết nối MySQL thực tế của bạn:

Đoạn mã
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shop_db
JWT_SECRET=your_secret_key_here
Bước 5: Khởi động Server

Bash
npm start
# Server sẽ chạy tại địa chỉ: http://localhost:3000
📱 Ứng dụng Frontend (Mobile App)
Phần giao diện người dùng (Mobile App) được phát triển bằng Flutter / React Native.
👉 Xem chi tiết mã nguồn Frontend tại đây: https://github.com/ChickenNewbie/CHPS-shop.git
