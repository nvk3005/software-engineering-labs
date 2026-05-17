# Bài tập Buổi 04 - 11/05/2026

## LuxeWatch - E-Commerce

---

## Tech Stack

### Backend

- NodeJS
- ExpressJS
- MongoDB
- Mongoose ODM
- JWT Access Token
- Refresh Token
- BcryptJS mã hóa mật khẩu
- Nodemailer SMTP gửi OTP
- Express Rate Limit
- Helmet
- CORS

### Frontend

- ReactJS
- Vite
- React Router DOM
- Redux Toolkit
- React Redux Hook
- Axios
- TailwindCSS
- CSS variables
- Lucide React Icons

---

## Các Chức Năng Của Dự Án

### Authentication

- Đăng ký tài khoản.
- Mã hóa mật khẩu bằng Bcrypt.
- Gửi OTP kích hoạt tài khoản qua email.
- Đăng nhập bằng email và mật khẩu.
- Cấp JWT access token và refresh token.
- Đăng xuất.
- Quên mật khẩu.
- Gửi OTP đặt lại mật khẩu.
- Đặt lại mật khẩu mới.
- Rate limiting cho các API authentication.

### User

- Xem thông tin thành viên.
- Cập nhật hồ sơ cá nhân.

### Product

- Hiển thị danh sách sản phẩm.
- Tìm kiếm sản phẩm theo tên hoặc thương hiệu.
- Lọc theo danh mục.
- Lọc theo thương hiệu.
- Lọc theo khoảng giá.
- Lọc theo rating.
- Lọc nhanh: hàng mới, bán chạy, đang sale.
- Sắp xếp theo giá, rating, bán chạy, mới nhất.
- Phân trang sản phẩm.
- Xem chi tiết sản phẩm.
- Hiển thị nhiều ảnh sản phẩm.
- Hiển thị tồn kho.
- Hiển thị số lượng đã bán.
- Tăng giảm số lượng mua.
- Hiển thị đánh giá, bình luận và phân phối sao.
- Hiển thị sản phẩm tương tự cùng danh mục.

### Cart

- Thêm sản phẩm vào giỏ hàng.
- Thay đổi số lượng sản phẩm.
- Xóa sản phẩm khỏi giỏ hàng.
- Tính tạm tính giỏ hàng.

---

## Cách Chạy Dự Án

### 1. Clone dự án từ URL

```bash
git clone https://github.com/nvk3005/software-engineering-labs.git
```

### 2. Di chuyển vào thư mục dự án

```bash
cd software-engineering-labs/Buoi04_1305
```

### 3. Cấu hình Backend

Truy cập thư mục backend:

```bash
cd backend
```

Cài đặt thư viện:

```bash
npm install
```

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Nội dung cấu hình mẫu:

```env
PORT=8000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/luxewatch
JWT_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=LuxeWatch <no-reply@luxewatch.local>
```

Ghi dữ liệu mẫu vào MongoDB:

```bash
npm run seed
```

Khởi động backend:

```bash
npm run dev
```

Backend chạy tại:

```text
http://localhost:8000
```

### 4. Cấu hình Frontend

Mở terminal mới và truy cập thư mục frontend:

```bash
cd frontend
```

Cài đặt thư viện:

```bash
npm install
```

Tạo hoặc kiểm tra file `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Khởi động frontend:

```bash
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

### 5. Tài Khoản Demo

```text
Email: demo@luxewatch.test
Password: Password123!
```

---

## API Backend

Base URL:

```text
http://localhost:8000/api
```

### Health Check

| Method | API | Mô tả |
| --- | --- | --- |
| GET | `/health` | Kiểm tra server |

### Auth

| Method | API | Mô tả |
| --- | --- | --- |
| POST | `/auth/v1/register` | Đăng ký tài khoản |
| POST | `/auth/v1/verify-otp` | Xác minh OTP kích hoạt |
| POST | `/auth/v1/login` | Đăng nhập |
| POST | `/auth/v1/refresh-token` | Cấp lại access token |
| POST | `/auth/v1/forgot-password` | Gửi OTP quên mật khẩu |
| POST | `/auth/v1/reset-password` | Đặt lại mật khẩu |
| POST | `/auth/v1/logout` | Đăng xuất |

### User

| Method | API | Mô tả |
| --- | --- | --- |
| GET | `/users/me` | Lấy thông tin người dùng hiện tại |
| PUT | `/users/me` | Cập nhật hồ sơ người dùng |

### Product

| Method | API | Mô tả |
| --- | --- | --- |
| GET | `/products` | Danh sách sản phẩm, tìm kiếm, lọc, sắp xếp, phân trang |
| GET | `/products/:id` | Chi tiết sản phẩm và sản phẩm tương tự |

Query parameters cho `GET /products`:

| Query | Mô tả |
| --- | --- |
| `search` | Tìm theo tên hoặc thương hiệu |
| `category` | Lọc theo danh mục |
| `brand` | Lọc theo thương hiệu |
| `minPrice` | Giá tối thiểu |
| `maxPrice` | Giá tối đa |
| `sort` | `price_asc`, `price_desc`, `rating`, `sold`, `newest` |
| `isNew` | Lọc hàng mới |
| `isHot` | Lọc hàng bán chạy |
| `isSale` | Lọc hàng đang sale |
| `minRating` | Rating tối thiểu |
| `page` | Trang hiện tại |
| `limit` | Số sản phẩm mỗi trang |


### Cart

| Method | API | Mô tả |
| --- | --- | --- |
| GET | `/cart` | Lấy giỏ hàng |
| POST | `/cart` | Thêm sản phẩm vào giỏ |
| PATCH | `/cart/:productId` | Cập nhật số lượng |
| DELETE | `/cart/:productId` | Xóa sản phẩm khỏi giỏ |

---

## Routes Frontend

| Route | Mô tả |
| --- | --- |
| `/auth` | Trang đăng nhập, đăng ký, quên mật khẩu |
| `/` | Trang chủ, danh sách sản phẩm, lọc, giỏ hàng, hồ sơ |
| `/products/:id` | Trang chi tiết sản phẩm |


## Kết Quả Chạy Trang Web

### Trang Đăng Nhập

![Login](https://res.cloudinary.com/dhi0ztkny/image/upload/v1778994963/login_hc5mfo.jpg)

### Trang Chủ - Danh Sách Sản Phẩm

![Homepage 01](https://res.cloudinary.com/dhi0ztkny/image/upload/v1778994965/home_page_01_oz0uy5.png)

### Trang Chủ - Giỏ Hàng Và Thông Tin Thành Viên

![Homepage 02](https://res.cloudinary.com/dhi0ztkny/image/upload/v1778994965/home_page_02_ve9pl4.png)

### Trang Chi Tiết Sản Phẩm

![Product Detail 01](https://res.cloudinary.com/dhi0ztkny/image/upload/v1778994964/detail_product_01_hiw0ml.png)

### Trang Chi Tiết Sản Phẩm - Đánh Giá Và Sản Phẩm Tương Tự

![Product Detail 02](https://res.cloudinary.com/dhi0ztkny/image/upload/v1778994964/detail_product_02_nfukfl.png)

---
