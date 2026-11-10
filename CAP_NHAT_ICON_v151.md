# Cập nhật biểu tượng ứng dụng v151

Gói này sửa liên kết favicon bị thiếu trên bản đã xuất bản và thay phiên bản URL icon để trình duyệt nhận diện lần cập nhật mới. Logo Tiền Phong trên màn hình đăng nhập được giữ đúng như bản v150.

## Tải lên GitHub

1. Giải nén `cap-nhat-icon-v151.zip`.
2. Tải 9 tệp ứng dụng đã giải nén vào thư mục gốc của kho `tandv0521-commits/baocao`, nhánh `main`, ghi đè các tệp cùng tên.
3. Đợi GitHub Pages/Vercel triển khai xong. Tệp ZIP là gói để giải nén; việc tải riêng ZIP lên kho không cập nhật ứng dụng.

Các tệp ứng dụng: `index.html`, `manifest.json`, `sw.js`, `favicon.ico`, `favicon.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `tienphong_logo2.png`.

Địa chỉ đang xuất bản:

- https://baocao-dvkh.vercel.app/
- https://tandv0521-commits.github.io/baocao/

Dùng đúng địa chỉ đã cài ứng dụng trước đó. Mỗi tên miền có bản cài và dữ liệu lưu trên thiết bị riêng.

## Kiểm tra sau khi triển khai

Mở `manifest.json` tại địa chỉ ứng dụng: các mục `icons` phải có `?v=151`. Mở `favicon.ico?v=151` và `icon-512.png?v=151`: phải tải được icon mới. `sw.js` phải có cache `baocao-dvkh-pwa-v151`.

## Cập nhật biểu tượng đã cài

Trước khi gỡ bản cài, lưu nội dung đang nhập và chuẩn bị đăng nhập lại. Việc gỡ web app trên điện thoại có thể xóa dữ liệu lưu cục bộ của bản cài.

- **PC / Chrome:** mở ứng dụng, chọn thông báo **App update available → Review app update → Update** nếu xuất hiện. Nếu ứng dụng/lối tắt vẫn giữ icon cũ, gỡ bản cài cũ trong `chrome://apps` rồi cài lại từ đúng địa chỉ HTTPS. Khi gỡ, để trống tùy chọn xóa dữ liệu trang web.
- **PC / Edge:** quản lý bản cài tại `edge://apps`. Nếu không có lựa chọn cập nhật icon, gỡ bản cài và cài lại từ đúng địa chỉ HTTPS; giữ dữ liệu trang web nếu có tùy chọn này.
- **Android:** mở ứng dụng khi có mạng và xác nhận cập nhật icon nếu trình duyệt yêu cầu. Nếu cần nhận ngay mà icon vẫn cũ, gỡ bản PWA trong phần quản lý ứng dụng của điện thoại rồi mở website bằng Chrome và chọn **Cài đặt ứng dụng**.
- **iPhone / iPad:** gỡ biểu tượng trang web cũ khỏi Màn hình chính; mở đúng website bằng Safari, chọn **Chia sẻ → Thêm vào Màn hình chính**. Kiểm tra icon mới trong màn hình xem trước rồi bấm **Thêm**.

Biểu tượng đã cài do trình duyệt và hệ điều hành quản lý. Thay ảnh hoặc tăng cache Service Worker không thể bắt buộc mọi thiết bị tự đổi icon. Lối tắt `Bao Cao DVKH.url` trong thư mục máy tính trỏ tới ổ `E:` và chỉ dùng cho bản chạy tại máy.

Tài liệu: https://developer.chrome.com/blog/improvements-to-web-app-updates ; https://support.google.com/chrome/answer/9658361 ; https://support.apple.com/en-au/guide/iphone/iph42ab2f3a7/ios
