# Hướng Dẫn Kiểm Thử Tính Năng Hot Update (PRXTuber)

Tài liệu này hướng dẫn chi tiết cách cấu hình, vận hành và kiểm thử tính năng **Hot Update (OTA - Over The Air)** trong ứng dụng **PRXTuber** ở cả môi trường **Debug (Development)** và **Release (Production)**.

---

## 1. Tổng quan Kiến Trúc & Cấu Hình

- **Công nghệ**: `@hot-updater/react-native` + `@hot-updater/cloudflare` (Cloudflare R2 & D1).
- **Update Server Endpoint**: `https://prxtuber-updater-worker.iop883684.workers.dev/api/check-update`
- **Chiến lược cập nhật**: `appVersion` (Phân phối bản vá theo phiên bản ứng dụng Native).
- **Màn hình tải cập nhật**: [HotUpdaterLoadingScreen.js](file:///Volumes/Data/Project/Other/PRXTuber/src/components/HotUpdaterLoadingScreen.js) hiển thị thanh tiến trình %, dung lượng đã tải (MB), spinner và ghi chú.
- **Tập tin cấu hình**: [src/config/hotUpdater.js](file:///Volumes/Data/Project/Other/PRXTuber/src/config/hotUpdater.js).

---

## 2. Các Thay Đổi Đã Hoàn Thiện Trong Mã Nguồn

1. **[src/config/hotUpdater.js](file:///Volumes/Data/Project/Other/PRXTuber/src/config/hotUpdater.js)**:
   - Quản lý tập trung `baseURL`, `updateStrategy`.
   - Bổ sung cờ `enableInDev`: Cho phép bật tính năng Hot Updater ngay trong chế độ Debug (`__DEV__`).

2. **[App.js](file:///Volumes/Data/Project/Other/PRXTuber/App.js)**:
   - Đã kết nối `fallbackComponent: HotUpdaterLoadingScreen` vào `HotUpdater.wrap(...)`. Khi có bản cập nhật bắt buộc (Force Update), màn hình tải chuyên nghiệp sẽ tự động hiển thị.
   - Tự động bỏ qua HotUpdater khi lập trình thông thường để giữ Metro Fast Refresh mượt mà, nhưng kích hoạt khi `enableInDev = true` hoặc khi build Release.

3. **[src/screens/SettingsScreen.js](file:///Volumes/Data/Project/Other/PRXTuber/src/screens/SettingsScreen.js)**:
   - Thêm nút **"Kiểm tra bản cập nhật" (Check for updates)**: Người dùng hoặc tester có thể chủ động bấm kiểm tra bất cứ lúc nào.
   - Hiển thị mã **OTA Bundle ID** đang chạy dưới phần thông tin Version ở cuối màn hình Cài đặt.
   - Khi có bản cập nhật, hiển thị hộp thoại xác nhận tải và tùy chọn khởi động lại app ngay sau khi tải xong.

4. **[package.json](file:///Volumes/Data/Project/Other/PRXTuber/package.json)**:
   - Cập nhật lệnh `npm run hot:doctor` tự động truyền `--server-base-url` để kiểm tra toàn diện hệ thống chỉ với một lệnh duy nhất.

5. **Bản vá lỗi chữ ký số iOS (`patches/@hot-updater+react-native+0.33.2.patch`)**:
   - Khắc phục lỗi **"Bundle signature verification failed"** trên iOS: Mã nguồn gốc của thư viện dùng thuật toán `.rsaSignatureDigestPKCS1v15SHA256` (không hash SHA-256 lại digest), trong khi Node.js CLI và Android Java dùng `RSA-SHA256` (hash `fileHash` 32-byte qua SHA-256 trước khi ký RSA).
   - Bản vá đã cập nhật `SignatureVerifier.swift` để hỗ trợ `.rsaSignatureMessagePKCS1v15SHA256` đồng bộ 100% với CLI và Android.
   - Bổ sung kiểm tra mã trạng thái HTTP trong `URLSessionDownloadService.swift` để từ chối ngay lập tức khi máy chủ trả về mã lỗi (như 404, 500), tránh việc lưu nội dung lỗi HTML/text làm file zip hỏng.

6. **Cloudflare Worker ([cloudflare-worker/src/index.ts](file:///Volumes/Data/Project/Other/PRXTuber/cloudflare-worker/src/index.ts))**:
   - Khắc phục lỗi Cloudflare Worker trước đó thiếu route tải bundle (`/prxtuber-bundles/*`), khiến máy chủ trả về `404 Not Found` (13 bytes) khi app yêu cầu tải bundle. App tải 13 bytes này về và kiểm tra chữ ký số nên báo lỗi `Bundle signature verification failed`.
   - Bổ sung cấu hình Cloudflare Worker chuẩn hóa với route `app.get('*')` xác thực JWT token và stream trực tiếp `bundle.zip` từ Cloudflare R2 bucket `prxtuber-bundles`. Đã deploy thành công lên worker `prxtuber-updater-worker`.

---

## 3. Quy Trình Kiểm Thử Chuẩn Xác Nhất (Local Release Build)

> [!IMPORTANT]
> Đây là phương pháp kiểm thử chuẩn xác nhất, mô phỏng 100% trải nghiệm của người dùng thực tế mà không cần đẩy app lên Store.

### Bước 1: Build và cài đặt bản App gốc (V1)
Mở terminal tại thư mục dự án và chạy:

- **Dành cho Android**:
  ```bash
  npx expo run:android --variant release
  ```
  *(Hoặc build file APK: `cd android && ./gradlew assembleRelease`, sau đó cài đặt: `adb install -r android/app/build/outputs/apk/release/app-release.apk`)*

- **Dành cho iOS**:
  ```bash
  npx expo run:ios --configuration Release
  ```
  *(Hoặc mở `ios/PrxTuber.xcworkspace` trong Xcode -> Scheme `PrxTuber` -> Edit Scheme -> Run -> Đổi Build Configuration thành `Release` -> Bấm Run lên Simulator hoặc iPhone thật)*

Sau khi cài đặt xong, mở app lên. Đây là phiên bản gốc **V1**.

---

### Bước 2: Tạo thay đổi trong mã nguồn (Bản V2)
Sửa một chi tiết dễ nhận biết trên giao diện. Ví dụ trong [src/screens/HomeScreen.js](file:///Volumes/Data/Project/Other/PRXTuber/src/screens/HomeScreen.js), thêm một banner:

```jsx
<View style={{ backgroundColor: '#FF3B30', padding: 12, borderRadius: 8, margin: 16 }}>
  <Text style={{ color: '#FFF', fontWeight: 'bold', textAlign: 'center' }}>
    🎉 HOT UPDATE V2 TEST THÀNH CÔNG!
  </Text>
</View>
```

---

### Bước 3: Deploy bản vá lên Hot Updater Server
Chạy tiện ích deploy có sẵn của dự án:
```bash
npm run hot:deploy
```
Hoặc dùng lệnh CLI trực tiếp:
- **Deploy Android**:
  ```bash
  npx hot-updater deploy -p android -f -m "Test Hot Update V2"
  ```
- **Deploy iOS**:
  ```bash
  npx hot-updater deploy -p ios -f -m "Test Hot Update V2"
  ```

*(Cờ `-f` tương đương Force Update: App sẽ tự động áp dụng và nạp lại ngay lập tức sau khi tải xong)*.

---

### Bước 4: Kiểm tra kết quả trên thiết bị
1. Mở lại app trên máy ảo hoặc thiết bị thật.
2. Màn hình **PrxTuber Hot Updater** ([HotUpdaterLoadingScreen.js](file:///Volumes/Data/Project/Other/PRXTuber/src/components/HotUpdaterLoadingScreen.js)) sẽ xuất hiện:
   - Hiển thị spinner "Đang kiểm tra bản cập nhật...".
   - Chuyển sang thanh tiến trình hiển thị `%` và số `MB` tải về.
3. Khi đạt 100%, ứng dụng sẽ tự động nạp lại và hiển thị ngay nội dung mới của bản V2.
4. Mở tab **Settings** -> kiểm tra mục Version ở dưới cùng -> Bạn sẽ thấy hiển thị mã **OTA Bundle ID** mới!

---

## 4. Quy Trình Kiểm Thử Nhanh Trong Chế Độ DEBUG (__DEV__)

Nếu bạn muốn kiểm tra giao diện cập nhật, kiểm tra kết nối API hoặc luồng tải bundle mà không cần build bản Release:

1. Mở file [src/config/hotUpdater.js](file:///Volumes/Data/Project/Other/PRXTuber/src/config/hotUpdater.js), chuyển `enableInDev` thành `true`:
   ```javascript
   export const HOT_UPDATER_CONFIG = {
     baseURL: "https://prxtuber-updater-worker.iop883684.workers.dev/api/check-update",
     updateStrategy: "appVersion",
     enableInDev: true, // 👈 Bật true để test trong chế độ debug
   };
   ```
2. Khởi chạy app như bình thường:
   ```bash
   npx expo run:android
   # hoặc
   npx expo run:ios
   ```
3. **Cách test 1 - Tự động khi mở app**:
   - Khi app vừa khởi động, `HotUpdater.wrap` sẽ chạy và kiểm tra cập nhật với Cloudflare server.
4. **Cách test 2 - Kiểm tra chủ động trong Settings**:
   - Vào màn hình **Settings**.
   - Bấm vào mục **"Kiểm tra bản cập nhật"**.
   - App sẽ hiển thị Toast "Đang kiểm tra bản cập nhật...".
   - Nếu có bản cập nhật mới trên server: Sẽ xuất hiện Alert thông báo nội dung cập nhật và Bundle ID -> Bấm **"Cập nhật ngay"** để kiểm tra quá trình tải.

> [!NOTE]
> Khi ở chế độ Debug, sau khi tải xong bundle, Metro Dev Server vẫn đang hoạt động trên máy nên việc reload có thể vẫn tải code từ Metro. Để kiểm tra trọn vẹn việc nạp bundle tĩnh từ đĩa, hãy sử dụng **Quy trình 3 (Local Release Build)**. Sau khi test debug xong, hãy nhớ đưa `enableInDev` về `false`.

---

## 5. Các Lệnh Hữu Ích Cho Quản Trị & Vận Hành

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run hot:doctor` | Kiểm tra kết nối máy chủ Cloudflare, phiên bản API và cấu hình Native iOS/Android |
| `npm run hot:console` | Mở giao diện Web Console trực quan để quản lý các bundle |
| `npm run hot:list` | Liệt kê danh sách các bundle đã deploy (ID, ngày, nền tảng, trạng thái) |
| `npm run hot:deploy` | Chạy công cụ deploy tương tác có sẵn trong dự án |
| `npx hot-updater bundle disable <bundle-id>` | Tắt một bundle cụ thể khi phát hiện sự cố |
| `npx hot-updater rollback production -p android` | Rollback ngay lập tức về bundle hoạt động gần nhất trên Android |
| `npx hot-updater rollback production -p ios` | Rollback ngay lập tức về bundle hoạt động gần nhất trên iOS |
