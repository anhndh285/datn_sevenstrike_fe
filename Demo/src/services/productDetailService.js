// src/services/productDetailService.js
import apiClient from "./apiClient";

const BASE = "/api/admin/chi-tiet-san-pham";

const unwrapList = (res) => (Array.isArray(res.data) ? res.data : res.data?.data ?? []);

const getAll = async () => {
  const res = await apiClient.get(BASE);
  return unwrapList(res);
};

const getOne = async (id) => {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res.data;
};

// Nếu BE có endpoint này thì dùng, không có thì đừng gọi
const getBySanPham = async (idSanPham) => {
  const res = await apiClient.get(`${BASE}/by-san-pham/${idSanPham}`);
  return unwrapList(res);
};

const create = async (payload) => {
  const res = await apiClient.post(BASE, payload);
  return res.data;
};

const update = async (id, payload) => {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data;
};

const remove = async (id) => {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data;
};

// ✅ Alias để đồng bộ tên hàm FE đang dùng
const softDelete = async (id) => remove(id);

export default {
  getAll,
  getOne,
  getBySanPham,
  create,
  update,
  remove,
  softDelete,
};
