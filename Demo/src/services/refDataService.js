import apiClient from "./apiClient";

export const refDataService = {
  getThuongHieu() { return apiClient.get("/api/admin/thuong-hieu"); },
  getXuatXu() { return apiClient.get("/api/admin/xuat-xu"); },
  getMauSac() { return apiClient.get("/api/admin/mau-sac"); },
  getKichThuoc() { return apiClient.get("/api/admin/kich-thuoc"); },
  getLoaiSan() { return apiClient.get("/api/admin/loai-san"); },
  getFormChan() { return apiClient.get("/api/admin/form-chan"); },
  getCoGiay() { return apiClient.get("/api/admin/co-giay"); },
  getChatLieu() { return apiClient.get("/api/admin/chat-lieu"); },
  getViTriThiDau() { return apiClient.get("/api/admin/vi-tri-thi-dau"); },
  getPhongCachChoi() { return apiClient.get("/api/admin/phong-cach-choi"); },
};
