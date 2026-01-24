const API = 'http://localhost:8080/api/admin/khach-hang'

export const getAllKhachHang = async () => {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Load dữ liệu khách hàng thất bại')
  return await res.json()
}

export const addKhachHang = async (data) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.text()
    throw new Error('Thêm thất bại: ' + errorData)
  }
  return await res.json()
}

export const updateKhachHang = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Cập nhật thất bại')
}

export const detailKhachHang = async (id) => {
  const res = await fetch(`${API}/${id}`)
  if (!res.ok) throw new Error('Không tìm thấy khách hàng')
  return await res.json()
}

export const removeKhachHang = async (id) => {
  const res = await fetch(`${API}/remove?id=${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Xóa khách hàng thất bại')
}

export const searchKhachHang = async (keyword) => {
  const res = await fetch(`${API}/search?keyword=${keyword}`)
  return await res.json()
}

export const pagingKhachHang = async (page = 0, size = 5) => {
  const res = await fetch(`${API}/page?pageNo=${page}&pageSize=${size}`)
  return await res.json()
}

export const sendEmailKhachHang = async (email, data) => {
  const res = await fetch(`${API}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, ...data }),
  })

  if (!res.ok) {
    const errorData = await res.text()
    throw new Error('Gửi email thất bại: ' + errorData)
  }
  return await res.json()
}
