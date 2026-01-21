// File: Demo/src/services/productService.js
import apiClient from "./apiClient";

const BASE = "/api/admin/san-pham";

const getAll = async () => {
  const res = await apiClient.get(BASE);
  // hỗ trợ: BE trả [] hoặc {data: []} hoặc {data:{data:[]}}
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};

const getOne = async (id) => {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res.data;
};

const create = async (payload) => {
  const res = await apiClient.post(BASE, payload);
  return res.data;
};

const update = async (id, payload) => {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res.data;
};

// Xóa mềm: ưu tiên DELETE nếu BE đang dùng như bạn làm CTSP
// Nếu BE của bạn dùng PUT/PATCH khác, đọc ghi chú bên dưới để đổi đúng endpoint.
const softDelete = async (id) => {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data;
};

export default {
  getAll,
  getOne,
  create,
  update,
  softDelete,
};
