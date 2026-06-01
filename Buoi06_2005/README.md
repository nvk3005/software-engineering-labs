# Bài tập Buổi 06 - 20/05/2026

## LuxeWatch - E-Commerce Đồng Hồ Cao Cấp

Ứng dụng bán hàng đồng hồ cao cấp gồm Backend REST API và Frontend React. Dự án hỗ trợ xác thực người dùng, quản lý sản phẩm, giỏ hàng lưu bằng Database, thanh toán COD và theo dõi lịch sử/trạng thái đơn hàng.

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
- CSS variables + custom dark luxury theme
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
- Cập nhật hồ sơ cá nhân gồm họ tên, số điện thoại, địa chỉ.

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
- Hiển thị sản phẩm theo từng danh mục.
- Hỗ trợ tải thêm sản phẩm theo danh mục bằng nút `Xem thêm`.
- Hiển thị 10 sản phẩm bán chạy nhất.
- Hiển thị 10 sản phẩm xem nhiều nhất.
- Phân trang ngang cho nhóm bán chạy và xem nhiều.
- Tăng lượt xem khi người dùng mở trang chi tiết sản phẩm.
- Xem chi tiết sản phẩm.
- Hiển thị nhiều ảnh sản phẩm.
- Hiển thị tồn kho.
- Hiển thị số lượng đã bán.
- Tăng giảm số lượng mua.
- Hiển thị đánh giá, bình luận và phân phối sao.
- Hiển thị sản phẩm tương tự cùng danh mục.

### Cart

- Thêm sản phẩm vào giỏ hàng.
- Lấy giỏ hàng hiện tại của người dùng.
- Thay đổi số lượng sản phẩm.
- Chặn số lượng vượt quá tồn kho.
- Xóa sản phẩm khỏi giỏ hàng.
- Tính tạm tính giỏ hàng.
- Lưu trữ giỏ hàng bằng MongoDB thông qua model `Cart`.
- Tự động xóa giỏ hàng sau khi đặt hàng thành công.

### Checkout COD

- Thanh toán đơn hàng bằng phương thức bắt buộc `COD`.
- Tạo đơn hàng từ dữ liệu giỏ hàng hiện tại.
- Lưu snapshot sản phẩm trong đơn gồm tên, thương hiệu, ảnh, giá, số lượng và thành tiền.
- Lưu thông tin giao hàng gồm họ tên, số điện thoại, địa chỉ và ghi chú.
- Trừ tồn kho và tăng số lượng đã bán sau khi đặt hàng.
- Điều hướng sang trang chi tiết đơn hàng sau khi checkout thành công.

### Order Tracking

- Xem lịch sử mua hàng của người dùng.
- Xem chi tiết từng đơn hàng.
- Theo dõi trạng thái đơn hàng bằng timeline.
- Các trạng thái đơn hàng:
  - `NEW`: Đơn hàng mới.
  - `CONFIRMED`: Đã xác nhận đơn hàng.
  - `PREPARING`: Shop đang chuẩn bị hàng.
  - `SHIPPING`: Đang giao hàng.
  - `DELIVERED`: Đã giao thành công.
  - `CANCELLED`: Hủy đơn hàng.
  - `CANCEL_REQUESTED`: Gửi yêu cầu hủy đơn cho shop.
- Tự động chuyển đơn từ `NEW` sang `CONFIRMED` sau 30 phút khi API đọc đơn hàng.
- Cho phép hủy trực tiếp trong 30 phút đầu nếu đơn còn ở trạng thái `NEW`.
- Nếu đơn ở trạng thái `PREPARING`, thao tác hủy sẽ chuyển thành gửi yêu cầu hủy cho shop.
- Không cho hủy khi đơn đang giao hoặc đã giao thành công.

### UI

- Giao diện dark luxury theme.
- Responsive layout.
- Dùng TailwindCSS.
- Component hóa giao diện: product card, filter, cart panel, profile panel, header, carousel ngang, section sản phẩm theo danh mục.
- Thêm trang thanh toán COD.
- Thêm trang lịch sử đơn hàng.
- Thêm trang chi tiết và theo dõi trạng thái đơn hàng.
- Header có liên kết đến giỏ hàng/checkout và đơn hàng.

---

## Cách Chạy Dự Án

### 1. Clone dự án từ URL

```bash
git clone https://github.com/nvk3005/software-engineering-labs.git
```

### 2. Di chuyển vào thư mục bài tập

```bash
cd software-engineering-labs/Buoi06_2005
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

Cấu hình mẫu:

```env
PORT=8000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/luxewatch
JWT_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
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

| Method | API       | Mô tả           |
| ------ | --------- | --------------- |
| GET    | `/health` | Kiểm tra server |

### Auth

| Method | API                        | Mô tả                    |
| ------ | -------------------------- | ------------------------ |
| POST   | `/auth/v1/register`        | Đăng ký tài khoản        |
| POST   | `/auth/v1/verify-otp`      | Xác minh OTP kích hoạt   |
| POST   | `/auth/v1/login`           | Đăng nhập                |
| POST   | `/auth/v1/refresh-token`   | Cấp lại access token     |
| POST   | `/auth/v1/forgot-password` | Gửi OTP quên mật khẩu    |
| POST   | `/auth/v1/reset-password`  | Đặt lại mật khẩu         |
| POST   | `/auth/v1/logout`          | Đăng xuất                |

### User

| Method | API         | Mô tả                              |
| ------ | ----------- | ---------------------------------- |
| GET    | `/users/me` | Lấy thông tin người dùng hiện tại  |
| PUT    | `/users/me` | Cập nhật hồ sơ người dùng          |

### Product

| Method | API             | Mô tả                                                      |
| ------ | --------------- | ---------------------------------------------------------- |
| GET    | `/products`     | Danh sách sản phẩm, tìm kiếm, lọc, sắp xếp, phân trang     |
| GET    | `/products/top` | Lấy sản phẩm bán chạy nhất hoặc xem nhiều nhất             |
| GET    | `/products/:id` | Chi tiết sản phẩm, tăng lượt xem và lấy sản phẩm tương tự  |

Query parameters cho `GET /products`:

| Query       | Mô tả                                                  |
| ----------- | ------------------------------------------------------ |
| `search`    | Tìm theo tên hoặc thương hiệu                          |
| `category`  | Lọc theo danh mục                                      |
| `brand`     | Lọc theo thương hiệu                                   |
| `minPrice`  | Giá tối thiểu                                          |
| `maxPrice`  | Giá tối đa                                             |
| `sort`      | `price_asc`, `price_desc`, `rating`, `sold`, `newest`  |
| `isNew`     | Lọc hàng mới                                           |
| `isHot`     | Lọc hàng bán chạy                                      |
| `isSale`    | Lọc hàng đang sale                                     |
| `minRating` | Rating tối thiểu                                       |
| `page`      | Trang hiện tại                                         |
| `limit`     | Số sản phẩm mỗi trang                                  |

Query parameters cho `GET /products/top`:

| Query        | Mô tả                         |
| ------------ | ----------------------------- |
| `type=sold`  | Lấy sản phẩm bán chạy nhất    |
| `type=views` | Lấy sản phẩm xem nhiều nhất   |
| `page`       | Trang hiện tại                |
| `limit`      | Số sản phẩm mỗi trang         |

### Cart

| Method | API                | Mô tả                         |
| ------ | ------------------ | ----------------------------- |
| GET    | `/cart`            | Lấy giỏ hàng                  |
| POST   | `/cart`            | Thêm sản phẩm vào giỏ         |
| PATCH  | `/cart/:productId` | Cập nhật số lượng             |
| DELETE | `/cart/:productId` | Xóa sản phẩm khỏi giỏ         |

### Order

| Method | API                         | Mô tả                                            |
| ------ | --------------------------- | ------------------------------------------------ |
| POST   | `/orders/checkout`          | Tạo đơn hàng COD từ giỏ hàng hiện tại            |
| GET    | `/orders`                   | Lấy lịch sử đơn hàng của người dùng              |
| GET    | `/orders/:orderId`          | Lấy chi tiết và trạng thái một đơn hàng          |
| PATCH  | `/orders/:orderId/cancel`   | Hủy đơn hàng hoặc gửi yêu cầu hủy đơn cho shop   |


---

## Routes Frontend

| Route              | Mô tả                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `/auth`            | Trang đăng nhập, đăng ký, quên mật khẩu                                                     |
| `/`                | Trang chủ, danh sách sản phẩm, lọc, giỏ hàng, hồ sơ, top sản phẩm, sản phẩm theo danh mục   |
| `/products/:id`    | Trang chi tiết sản phẩm                                                                     |
| `/checkout`        | Trang thanh toán đơn hàng bằng COD                                                          |
| `/orders`          | Trang lịch sử mua hàng và danh sách đơn hàng                                                |
| `/orders/:orderId` | Trang chi tiết đơn hàng và timeline theo dõi trạng thái                                     |

---


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
