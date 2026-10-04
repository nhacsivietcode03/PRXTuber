/**
 * Cấu hình tập trung cho Hot Updater (OTA)
 */
export const HOT_UPDATER_CONFIG = {
  baseURL: "https://prxtuber-updater-worker.iop883684.workers.dev/api/check-update",
  updateStrategy: "appVersion",
  
  /**
   * Đặt enableInDev = true khi bạn muốn test quy trình kiểm tra & tải Hot Update ngay trong chế độ DEBUG (__DEV__).
   * Mặc định là false để tránh cản trở Fast Refresh / Metro khi phát triển code thông thường.
   */
  enableInDev: false,
};
