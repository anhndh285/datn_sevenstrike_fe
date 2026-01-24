// src/services/anhChiTietSanPhamService.js
import apiClient from "@/services/apiClient";

const BASE = "/api/admin/anh-chi-tiet-san-pham";

const unwrap = (res) => (res?.data ?? res);

// ✅ list unwrap (BE có thể trả List trực tiếp hoặc {data: []})
const unwrapList = (v) => {
  if (Array.isArray(v)) return v;
  const d = v?.data ?? v;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  return [];
};

const anhChiTietSanPhamService = {
  async getAll() {
    return unwrap(await apiClient.get(BASE));
  },

  async getOne(id) {
    return unwrap(await apiClient.get(`${BASE}/${id}`));
  },

  async create(payload) {
    return unwrap(await apiClient.post(BASE, payload));
  },

  async update(id, payload) {
    return unwrap(await apiClient.put(`${BASE}/${id}`, payload));
  },

  async remove(id) {
    // BE soft delete
    return unwrap(await apiClient.delete(`${BASE}/${id}`));
  },

  async getByChiTietSanPham(idChiTietSanPham) {
    const res = await apiClient.get(`${BASE}/by-chi-tiet-san-pham/${idChiTietSanPham}`);
    return unwrapList(res);
  },

  async setDaiDien(id) {
    return unwrap(await apiClient.put(`${BASE}/${id}/set-dai-dien`));
  },

  // ✅ upload file ảnh trực tiếp
  // params: { idChiTietSanPham, file, laAnhDaiDien=false, moTa="" }
  async upload({ idChiTietSanPham, file, laAnhDaiDien = false, moTa = "" }) {
    const fd = new FormData();
    fd.append("idChiTietSanPham", idChiTietSanPham);
    fd.append("file", file);
    fd.append("laAnhDaiDien", String(laAnhDaiDien));
    if (moTa !== undefined && moTa !== null) fd.append("moTa", moTa);

    const res = await apiClient.post(`${BASE}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },
};

export default anhChiTietSanPhamService;
