# Bài tập Buổi 03 - 11/05/2026

## Nội dung phụ trách
Thiết kế giao diện Quên mật khẩu (Forgot Password) và Nhập mật khẩu mới (Reset Password).

## Nội dung đã thực hiện

### 1. Giao diện Quên mật khẩu (`/forgot-password`)
- Thiết kế form nhập Email với validation bằng **Zod**.
- Xử lý gửi yêu cầu lấy mã OTP thông qua API.
- Hiển thị thông báo lỗi nếu Email không tồn tại hoặc có lỗi server.
- Tự động chuyển hướng sang trang Reset mật khẩu sau khi gửi yêu cầu thành công.

### 2. Giao diện Đặt lại mật khẩu (`/reset-password`)
- Hiển thị Email đã nhập (chế độ chỉ đọc).
- Form nhập mã **OTP (6 chữ số)**, **Mật khẩu mới** và **Xác nhận mật khẩu**.
- Validation kiểm tra độ dài mật khẩu (tối thiểu 6 ký tự) và khớp mật khẩu xác nhận.
- Xử lý gọi API xác thực OTP và cập nhật mật khẩu mới.
- Điều hướng về trang Đăng nhập sau khi thực hiện thành công.

## Công nghệ sử dụng
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Shadcn UI, React Hook Form, Zod, Axios.

## Các API chính (Backend)
- `POST /api/v1/auth/forgot-password`: Gửi yêu cầu lấy mã OTP qua Email.
- `POST /api/v1/auth/reset-password`: Xác thực mã OTP và tiến hành đổi mật khẩu mới.

---

## Cách chạy dự án

### 1. Clone dự án từ URL:
```bash
git clone https://github.com/nvk3005/software-engineering-labs.git
```

### 2. Di chuyển vào thư mục dự án:
```bash
cd software-engineering-labs/Buoi03_1105/MinLish
```

### 3. Cấu hình Backend
1. Truy cập thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ file `.env.example` và điền các thông tin cần thiết

4. Chạy server backend:
   ```bash
   npm run dev
   ```

### 4. Cấu hình Frontend
1. Truy cập thư mục frontend:
   ```bash
   cd ../frontend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Chạy ứng dụng frontend:
   ```bash
   npm run dev
   ```
4. Truy cập giao diện tại: `http://localhost:3000`
