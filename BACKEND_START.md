# Hướng dẫn Chạy Backend

## Vấn đề: ERR_CONNECTION_REFUSED

Lỗi này xảy ra khi backend server chưa được khởi động hoặc không chạy đúng cổng.

## Cách khắc phục

### 1. Chạy Backend riêng biệt

Mở terminal mới và chạy:

```bash
cd api
npm run dev
```

Hoặc nếu dùng nodemon:

```bash
cd api
nodemon server.ts
```

### 2. Chạy cả Frontend và Backend cùng lúc

Từ thư mục gốc:

```bash
npm run dev
```

Lệnh này sẽ chạy cả frontend (Vite) và backend (Node.js) cùng lúc.

### 3. Kiểm tra Backend đang chạy

Backend sẽ chạy trên port **5001** (mặc định).

Kiểm tra bằng cách mở: http://localhost:5001/api/health

Nếu thấy response `{"success":true,"message":"Server is healthy"}` thì backend đã chạy thành công.

### 4. Kiểm tra Environment Variables

Đảm bảo file `.env` trong thư mục `api/` có các biến sau:

```env
MONGODB_URI=mongodb://localhost:27017/cvmate
JWT_SECRET=your-secret-key
PORT=5001
FRONTEND_URL=http://localhost:5173
```

### 5. Kiểm tra MongoDB

Đảm bảo MongoDB đang chạy:

```bash
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# hoặc
sudo systemctl start mongod
```

## Troubleshooting

### Port 5001 đã được sử dụng

Thay đổi port trong `api/.env`:

```env
PORT=5002
```

Và cập nhật `VITE_API_URL` trong frontend `.env`:

```env
VITE_API_URL=http://localhost:5002/api
```

### Backend không kết nối được MongoDB

1. Kiểm tra MongoDB có đang chạy không
2. Kiểm tra `MONGODB_URI` trong `.env` có đúng không
3. Thử kết nối bằng MongoDB Compass hoặc CLI

### Lỗi khi install dependencies

```bash
cd api
rm -rf node_modules package-lock.json
npm install
```
