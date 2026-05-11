# MinLish Backend - Forgot & Reset Password

## Tính năng chính

### 1. Quên mật khẩu (Forgot Password)

- Người dùng gửi yêu cầu quên mật khẩu bằng Email.
- Hệ thống kiểm tra sự tồn tại của Email trong cơ sở dữ liệu.
- Tạo mã OTP ngẫu nhiên (6 chữ số) và lưu vào bảng `Otps` với thời gian hết hạn.
- Gửi mã OTP đến email của người dùng thông qua dịch vụ SMTP (Nodemailer).

### 2. Đặt lại mật khẩu (Reset Password)

- Người dùng nhập Email, mã OTP nhận được và mật khẩu mới.
- Hệ thống xác thực mã OTP:
  - Kiểm tra mã OTP có khớp với Email không.
  - Kiểm tra mã OTP đã hết hạn chưa.
  - Kiểm tra mã OTP đã được sử dụng trước đó chưa.
- Nếu hợp lệ, hệ thống sẽ mã hóa (hash) mật khẩu mới bằng `bcrypt` và cập nhật vào cơ sở dữ liệu.
- Đánh dấu mã OTP đã được sử dụng để tránh tái sử dụng.

## Công nghệ sử dụng

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MySQL (với Sequelize ORM)
- **Validation:** Zod (Xác thực dữ liệu đầu vào)
- **Email Service:** Nodemailer (Gửi mã OTP qua Gmail SMTP)
- **Security:** Bcrypt (Mã hóa mật khẩu)

## Cách chạy dự án

### 1. Clone dự án từ url:

```bash
git clone https://github.com/nvk3005/software-engineering-labs.git
```

### 2. Di chuyển vào thư mục dự án:

```bash
cd software-engineering-labs/Buoi02_0605/MinLish/backend
```

### 3. Cài đặt dependencies:

```bash
npm install
```

### 4. Cấu hình biến môi trường

Tạo file `.env` từ file `.env.example` và điền các thông tin cần thiết:

```env
PORT=5000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=minlish

# JWT Configuration
JWT_SECRET=your_secret_key

# Mail Configuration (Dùng để gửi OTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password # Sử dụng App Password của Gmail
```

### 5. Chạy dự án

Dùng lệnh sau để khởi động server ở chế độ development (với nodemon):

```bash
npm run dev
```

Server sẽ chạy mặc định tại: `http://localhost:5000`

## Kết quả testing với Postman

File collection đính kèm trong thư mục:
`MinLish.Forgot & Reset Password.postman_collection.json`

Các API chính:

- `POST /api/v1/auth/forgot-password`: Gửi yêu cầu lấy mã OTP.
- `POST /api/v1/auth/reset-password`: Xác thực OTP và đổi mật khẩu mới.
