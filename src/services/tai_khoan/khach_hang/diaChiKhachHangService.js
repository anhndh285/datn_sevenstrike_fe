// File: src/services/tai_khoan/khach_hang/diaChiKhachHangService.js
const API = "http://localhost:8080/api/admin/dia-chi-khach-hang";

const unwrapJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
};

const getErrorMessageFromResponse = async (res, fallback) => {
  const data = await unwrapJson(res);

  if (typeof data === "string" && data.trim()) {
    return `${fallback}: ${data}`;
  }

  if (data?.message) {
    return `${fallback}: ${data.message}`;
  }

  if (data?.error) {
    return `${fallback}: ${data.error}`;
  }

  return fallback;
};

const normalizeDiaChiPayload = (data = {}) => {
  const idKhachHang = data?.idKhachHang ?? data?.id_khach_hang ?? null;

  return {
    ...data,
    idKhachHang,
    id_khach_hang: idKhachHang,
  };
};

const getDiaChiKhachHangId = (item) => item?.idKhachHang ?? item?.id_khach_hang ?? null;

export const getAllDiaChiKhachHang = async () => {
  const res = await fetch(API);
  if (!res.ok) {
    throw new Error(await getErrorMessageFromResponse(res, "Load địa chỉ thất bại"));
  }
  return await unwrapJson(res);
};

export const getDiaChiByKhachHangId_FEFilter = async (idKhachHang) => {
  const all = await getAllDiaChiKhachHang();
  const arr = Array.isArray(all) ? all : [];

  return arr.filter(
    (x) => String(getDiaChiKhachHangId(x)) === String(idKhachHang) && !x?.xoaMem
  );
};

export const addDiaChiKhachHang = async (data) => {
  const payload = normalizeDiaChiPayload(data);

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessageFromResponse(res, "Thêm địa chỉ thất bại"));
  }

  return await unwrapJson(res);
};

export const createDiaChiKhachHang = addDiaChiKhachHang;

export const updateDiaChiKhachHang = async (id, data) => {
  const payload = normalizeDiaChiPayload(data);

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessageFromResponse(res, "Cập nhật địa chỉ thất bại"));
  }

  return await unwrapJson(res);
};

export const removeDiaChiKhachHang = async (id) => {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });

  if (!res.ok) {
    throw new Error(await getErrorMessageFromResponse(res, "Xóa địa chỉ thất bại"));
  }

  return true;
};