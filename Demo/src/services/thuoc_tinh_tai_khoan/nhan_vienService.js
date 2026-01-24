const API = 'http://localhost:8080/api/admin/nhan-vien'

export const getAllNhanVien = async () => {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Load dữ liệu thất bại')
  return await res.json()
}

export const addNhanVien = async (formData) => {
  const res = await fetch(API, {
    method: "POST",
    body: formData
  })

  if (!res.ok) {
    const errorData = await res.text()
    throw new Error('Thêm thất bại: ' + errorData)
  }
  return await res.json()
}

export const updateNhanVien = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Cập nhật thất bại')
}

export const detailNhanVien = async (id) => {
  const res = await fetch(`${API}/${id}`)
  if (!res.ok) throw new Error('Không tìm thấy nhân viên')
  return await res.json()
}

export const removeNhanVien = async (id) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Xóa thất bại')
}

export const searchNhanVien = async (keyword) => {
  const res = await fetch(`${API}/search?keyword=${keyword}`)
  return await res.json()
}

export const pagingNhanVien = async (page = 0, size = 5) => {
  const res = await fetch(`${API}/page?pageNo=${page}&pageSize=${size}`)
  return await res.json()
}
