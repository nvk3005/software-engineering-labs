# Bài tập Buổi 03 - 11/05/2026

---

## Giới thiệu dự án

Dự án Fullstack kết hợp giữa **Node.js (Express)** và **React.js (Vite)**. Hệ thống thực hiện các chức năng cơ bản về xác thực người dùng, quản lý tài khoản và tương tác với cơ sở dữ liệu MongoDB.

## Công nghệ sử dụng

### Backend (ExpressJS01)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Security:**
  - `jsonwebtoken` (JWT) để xác thực người dùng qua Access Token.
  - `bcrypt` để băm (hash) mật khẩu an toàn.

### Frontend (ReactJS01)

- **Library:** React.js (Vite)
- **UI Framework:** Ant Design (antd)
- **Icons:** @ant-design/icons
- **Routing:** React Router Dom v7
- **HTTP Client:** Axios

---

## Cách chạy dự án

### 1. Clone dự án từ url:

```bash
git clone https://github.com/nvk3005/software-engineering-labs.git
```

### 2. Di chuyển vào thư mục dự án:

```bash
cd software-engineering-labs/Buoi03_1105/FullStackNodeJS01
```

### 3. Cấu hình Backend (ExpressJS01)

1. Truy cập thư mục backend:
   ```bash
   cd ExpressJS01
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ file `.env.example` và điền các thông tin cần thiết:
   ```env
   PORT=8080
   MONGO_DB_URL=mongodb://localhost:27017/fullstack02
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=1h
   ```
4. Khởi động server:
   ```bash
   npm run dev
   ```
   Server sẽ chạy tại: `http://localhost:8080`_

### 4. Cấu hình Frontend (ReactJS01)

1. Truy cập thư mục frontend:
   ```bash
   cd ReactJS01/reactjs01
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Chạy ứng dụng React:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại: `http://localhost:5173` 
---

## Danh sách API (Backend)

| Method | Endpoint           | Auth |
| :----- | :----------------- | :--- |
| POST   | `/v1/api/register` | No   |
| POST   | `/v1/api/login`    | No   |
| GET    | `/v1/api/user`     | Yes  |
| GET    | `/v1/api/account`  | Yes  |

---
