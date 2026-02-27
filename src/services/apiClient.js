// File: src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "",
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

// ✅ Auto set Content-Type JSON nếu data là object thường
apiClient.interceptors.request.use(
  (config) => {
    // =========================================================
    // ✅ LỚP BẢO VỆ 2: CHẶN GỌI API THAY ĐỔI DỮ LIỆU NẾU CHƯA MỞ CA
    // =========================================================
    const method = config.method?.toLowerCase();
    
    // Nếu là các hành động Thêm (POST), Sửa (PUT/PATCH), Xóa (DELETE)
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      
      // KHÔNG CHẶN các API liên quan đến đăng nhập và giao ca
      const isAuthOrShiftApi = config.url?.includes('/login') || config.url?.includes('/giao-ca') || config.url?.includes('/nhan-vien');
      
      if (!isAuthOrShiftApi) {
        // Kiểm tra chìa khóa ca làm việc
        const hasActiveShift = sessionStorage.getItem("ss_has_active_shift") === "true";
        
        if (!hasActiveShift) {
          // Báo lỗi và bóp nghẹt request ngay lập tức
          alert("LỖI: Chế độ chỉ xem. Bạn chưa mở ca làm việc nên không thể thực hiện thao tác này!");
          return Promise.reject(new Error("Blocked by Shift Permission"));
        }
      }
    }
    // =========================================================

    // Phần code cũ của bạn: Xử lý FormData
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (!isFormData) {
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    } else {
      if (config.headers?.["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Bỏ qua log lỗi nếu lỗi đó là do bị chặn bởi Lớp bảo vệ 2 ở trên
    if (err.message === "Blocked by Shift Permission") {
      return Promise.reject(err);
    }

    const status = err?.response?.status;
    const data = err?.response?.data;

    // ✅ Nếu request đánh dấu silent thì không spam console
    const isSilent = !!err?.config?.meta?.silent;

    if (!isSilent) {
      console.error("API error:", status, data || err?.message);
    }

    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      err?.message ||
      "API error";

    err.userMessage = msg;
    return Promise.reject(err);
  }
);

export default apiClient;